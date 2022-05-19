// Spdx-License-Identifier: MIT
// Copyright 2022 - Laguna Labs
//
// This is a simple chainlab adapter that processes incoming json
// packages and outputs json.

/* eslint n/no-callback-literal: 0 */

const { ApiAdapter, echoFunc, stub1Func } =
      require('./api_adapter')

const app = new ApiAdapter({
  urlPost: {
    'nft-index': 'https://truflation-dev-8080.hydrogenx.tk/nft-calc/index-value'
  },
  urlGet: {
    'truflation/current': 'https://api.truflation.com/current',
    'truflation/at-date': 'https://truflation-api.hydrogenx.tk/at-date',
    'truflation/range': 'https://truflation-api.hydrogenx.tk/range'
  },
  urlEncodeData: {
    'truflation/at-date': true,
    'truflation/range': true
  },
  func: {
    echo: echoFunc,
    stub1: stub1Func
  }
})

app.listen(process.env.EA_PORT || 8082)
