const reduct = require('reduct')
const TestSuite = require('./src/testsuite')

if (require.main === module) {
  const testsuite = reduct()(TestSuite)
  testsuite.run()
} else {
  module.exports = {
    TestSuite
  }
}
