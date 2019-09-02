# ILP SPSP Pull Payment Server - Test Suite

## Description
The test suite was created to test this [ILP SPSP Pull Payment Server](https://github.com/sabinebertram/ilp-spsp-pull-payment-server) implementation. It contains the following tests:

* Create pull pointer
* Query pull pointer
* Pull once from pull pointer
* Pull twice from pull pointer
* Pull different asset scale
* Pull different currency
* Pull using a cap
* Pull after expiry


## Usage
First, start [moneyd](https://github.com/interledgerjs/moneyd) and have an instance of the [ILP SPSP Pull Payment Server](https://github.com/sabinebertram/ilp-spsp-pull-payment-server) running. To run the entire test suite, run
```sh
SPSP_SERVER_URL=<YOUR_URL> SPSP_AUTH_TOKEN=<YOUR_TOKEN> PRODUCTION=<true/false> PULL_POINTER_INTERVAL=<YOUR INTERVAL> npm test
```

### Config Parameters
| Name | Default | Description |
|---|---|---|
| SPSP_SERVER_URL | `http://localhost:6000` | URL that points to the running SPSP Pull Payment Server |
| SPSP_AUTH_TOKEN | `test` | Token that is needed to authenticate pull pointer creation requests on the SPSP Pull Payment Server |
| PRODUCTION | `false` | Flag indicating whether tests should be run on production server (which will incur costs) |
|PULL_POINTER_INTERVAL | `'PT10S'` | Pull agreement interval used when creating the pull pointer |

### Individual Testing

All tests can be run individually via
```sh
SPSP_SERVER_URL=<YOUR_URL> SPSP_AUTH_TOKEN=<YOUR_TOKEN> PRODUCTION=<true/false> PULL_POINTER_INTERVAL=<YOUR INTERVAL> npm test -- --testNamePattern="<Name of test>"
```