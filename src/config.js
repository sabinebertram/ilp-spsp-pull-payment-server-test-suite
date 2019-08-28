
class Config {
  constructor (deps) {
    this.spspUrl = process.env.SPSP_SERVER_URL || 'http://localhost:6000'
    this.spspToken = process.env.SPSP_AUTH_TOKEN || 'test'
    this.productionMode = process.env.PRODUCTION === 'true'
  }
}

module.exports = Config
