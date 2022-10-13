// Spdx-License-Identifier: MIT
// Copyright 2022 - Laguna Labs
//
// This is a simple chainlab adapter that processes incoming json
// packages and outputs json.

import nodecallspython from 'node-calls-python'
import {
  echoFunc, stub1Func, fuzzFunc, echoPythonFunc,
  TfiRequest
} from './api_adapter'
import path = require('node:path')

const py = nodecallspython.interpreter
const cpiCategories = py.importSync(
  path.join(__dirname, 'cpi_categories.py')
)

const truflationApiHost =
      process.env.TRUFLATION_API_HOST ??
      'https://api.truflation.io'
const truflationApiHostUk =
      process.env.TRUFLATION_API_HOST_UK ??
      'http://api.truflation.io:1066'
const truflationNftHost =
      process.env.TRUFLATION_NFT_HOST ??
      'http://nft.truflation.io:8080'

interface Location {
  location: string | undefined
  categories: string | undefined
  derivation: string | undefined
}

function addLocation (url: string, datain: Location): [string, Location] {
  const data = Object.assign({}, datain)
  if (data?.categories === 'true') {
    data['show-derivation'] = 'true'
  }
  if (data?.location === undefined) {
    return [url, data]
  }
  if (data.location === 'us') {
    delete data.location
    return [url, data]
  }
  if (data.location === 'uk') {
    url = url.replace(truflationApiHost,
      truflationApiHostUk)
    delete data.location
  }
  return [url, data]
}

interface TruflationData {
  categories?: string
  location?: string
}

function truflationPostProcess (body: TfiRequest, result: object): object {
  let data: TruflationData
  if ((typeof body.data === 'string' ||
    body.data instanceof String) &&
    body.data.replace(/\s/g, '').length !== 0) {
    data = JSON.parse(body.data.toString()) as TruflationData
  } else {
    data = (body.data as object ?? {}) as TruflationData
  }

  if (data?.categories !== 'true') {
    return result
  }
  const location = data?.location ?? 'us'
  return py.callSync(
    cpiCategories, 'postprocess_categories',
    location, result
  ) as object
}

const services = {
  urlPost: {
    'nft-index': `${truflationNftHost}/nft-calc/index-value`
  },
  urlGet: {
    'truflation/current': `${truflationApiHost}/current`,
    'truflation/at-date': `${truflationApiHost}/at-date`,
    'truflation/range': `${truflationApiHost}/range`,
    'nuon/dynamic-index': 'https://truflation-api-test.hydrogenx.live/nuon/dynamic-index',
    'nuon/static-index': 'https://truflation-api-test.hydrogenx.live/nuon/static-index',
    minertoken: 'http://api.truflation.io:2222/mt'
  },
  urlEncodeData: {
    'truflation/current': true,
    'truflation/at-date': true,
    'truflation/range': true,
    'nuon/dynamic-index': true,
    'nuon/static-index': true,
    minertoken: true
  },
  urlTransform: {
    'truflation/current': addLocation,
    'truflation/at-date': addLocation,
    'truflation/range': addLocation
  },
  urlPostProcess: {
    'truflation/current': truflationPostProcess,
    'truflation/at-date': truflationPostProcess,
    'truflation/range': truflationPostProcess
  },
  func: {
    echo: echoFunc,
    'echo/python': echoPythonFunc,
    stub1: stub1Func,
    fuzz: fuzzFunc
  }
}

const fuzz = {
  fuzz: {
    'nft-index': true,
    'truflation/at-date': true,
    'truflation/current': true,
    'truflation/range': true
  }
}

const randomizedServices = { ...services, ...fuzz }

module.exports = {
  services,
  randomizedServices
}
