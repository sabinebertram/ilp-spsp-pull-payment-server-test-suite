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
        url: this.config.spspUrl,
        method: 'post',
        data: JSON.stringify(body),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.config.spspToken
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

  async pullMultipleIntervals (pointer, amount, intervalCount) {
    let totalReceived = 0
    let i = 0
    while (i < intervalCount) {
      const pulled = await this.pull(pointer, amount)
      if (!pulled.totalReceived) {
        return { totalReceived: totalReceived, message: pulled.message }
      } else {
        totalReceived += Number(pulled.totalReceived)
        i++
        if (i < intervalCount) {
          await this.helpers.sleep(10000)
        }
      }
    }
    return { totalReceived }
  }
}

module.exports = PullFunctions
