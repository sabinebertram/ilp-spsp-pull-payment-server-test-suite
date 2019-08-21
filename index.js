const reduct = require('reduct')
const TestSuite = require('./src/testsuite')

if (require.main === module) {
  let run = async () => {
    let testsuite = await reduct()(TestSuite)
    testsuite.run()
  }
  run()
} else {
  module.exports = {
    TestSuite
  }
}
