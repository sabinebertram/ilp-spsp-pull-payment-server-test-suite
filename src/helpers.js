const chalk = require('chalk')
const logSymbols = require('log-symbols')

class Helpers {
  sleep (ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms)
    })
  }

  success (testName) {
    console.log(`Test ${testName} -`, logSymbols.success, chalk.green('Successful'))
  }

  simpleError (testName, message) {
    console.log(`Test ${testName} -`, logSymbols.error, chalk.red(`Failed. Error: ${message}`))
  }

  productionWarning (testName) {
    console.log(`Test ${testName} -`, logSymbols.warning, chalk.orange('Server is in production mode. Set PRODUCTION=true if you want to run the test. Warning: There is no refund of pulled funds.'))
  }

  valueError (testName, expectedValue, receivedValue, message) {
    console.log(`Test ${testName} -`, logSymbols.error, chalk.red(`Failed. Expected: ${expectedValue}, Received: ${receivedValue}. Error: ${message}`))
  }

  exchangeError (testName) {
    console.log(`Test ${testName} -`, logSymbols.error, chalk.red(`Failed: Could not fetch exchange rate.`))
  }
}

module.exports = Helpers
