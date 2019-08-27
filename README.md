# ILP SPSP Pull Payment Server - Test Suite

## Description
The test suite was created to test this [ILP SPSP Pull Payment Server](https://github.com/sabinebertram/ilp-spsp-pull-payment-server) implementation. It contains the following asynchronous test functions:

* `testCreatePointer ()`: tests that a pointer can be created
* `testQuery ()`: tests that a pointer can be queried
* `testPullMultipleIntervals (n)`: tests that one can pull n times
* `testPullDifferentCurrency ()`: tests that one can pull from a pointer denoted in a currency different from the connector's currency
* `testCap ()`: tests that pullable balances do not exceed the specified amount given `cap=true`
* `testExpiry ()`: tests that the pullable balance does not increase after all cycles are complete

Additionally, there is a `run()` function that runs all of the above, more specifically:
* `testCreatePointer ()`
* `testQuery ()`
* `testPullMultipleIntervals (1)`
* `testPullMultipleIntervals (2)`
* `testPullDifferentCurrency ()`
* `testCap ()`
* `testExpiry ()`

## Usage
First, start [moneyd](https://github.com/interledgerjs/moneyd) and have an instance of the [ILP SPSP Pull Payment Server](https://github.com/sabinebertram/ilp-spsp-pull-payment-server) running. To run the entire test suite, run
```sh
SPSP_SERVER_URL=<YOUR_URL> SPSP_AUTH_TOKEN=<YOUR_TOKEN> PRODUCTION=<true/false> npm start
```

### Config Parameters
| Name | Default | Description |
|---|---|---|
| SPSP_SERVER_URL | `http://localhost:6000` | URL that points to the running SPSP Pull Payment Server |
| SPSP_AUTH_TOKEN | `test` | Token that is needed to authenticate pull pointer creation requests on the SPSP Pull Payment Server |
| PRODUCTION | `false` | Flag indicating whether tests should be run on production server (which will incur costs) |

### Individual Testing

All tests can be run individually via importing this package
```js
const reduct = require('reduct')
const TestSuite = require('ilp-spsp-pull-payment-server-test-suite')

const testCreatePointer = async () => {
  let testsuite = await reduct()(TestSuite)
  testsuite.testCreatePointer()
}
testCreatePointer()
```