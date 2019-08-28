const axios = require('axios')
const SPSP = require('ilp-protocol-spsp')
const IlpPlugin = require('ilp-plugin')

const Config = require('./config')
const Helpers = require('./helpers')

class PullFunctions {
  constructor (deps) {
    this.config = deps(Config)
    this.helpers = deps(Helpers)
  }

  async createPointer (body) {
    try {
      const response = await axios({
        url: this.config.url,
        method: 'post',
        data: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.token
        }
      })
      return response.data
    } catch (err) {
      return err
    }
  }

  async pull (pointer, amount) {
    try {
      const plugin = IlpPlugin()
      const pulledAmount = await SPSP.pull(plugin, { pointer, amount, streamOpts: { timeout: 10000 } })
      return { totalReceived: pulledAmount.totalReceived }
    } catch (err) {
      if (err instanceof SPSP.PaymentError) {
        return { totalReceived: err.totalReceived }
      } else {
        return { totalReceived: 0, message: err.message }
      }
    }
  }

  async pullMultipleIntervals (pointer, amount, n) {
    const pulled = await this.pull(pointer, amount)
    let totalReceived = Number(pulled.totalReceived)
    if (!totalReceived) {
      return { totalReceived: 0, message: pulled.message }
    } else {
      for (let i = 1; i < n; i++) {
        await this.helpers.sleep(10000)
        let pulled = await this.pull(pointer, amount)
        totalReceived += Number(pulled.totalReceived)
      }
      return { totalReceived, message: pulled.message }
    }
  }
}

module.exports = PullFunctions
