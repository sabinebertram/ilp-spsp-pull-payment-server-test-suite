const reduct = require('reduct')
const TestSuite = require('./src/testsuite')

if (require.main === module) {
  const run = async () => {
    const testsuite = await reduct()(TestSuite)
    testsuite.run()
  }
  run()
} else {
  module.exports = {
    TestSuite
  }
}
