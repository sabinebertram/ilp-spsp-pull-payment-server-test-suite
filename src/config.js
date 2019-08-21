const IlpPlugin = require('ilp-plugin')

class Config {
  constructor (deps) {
    this.plugin = IlpPlugin()
    this.url = process.env.SPSP_SERVER_URL || 'http://localhost:6000'
    this.token = process.env.SPSP_AUTH_TOKEN || 'test'
    this.productionMode = process.env.PRODUCTION === 'true'
  }
}

module.exports = Config
