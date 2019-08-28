const SPSP = require('ilp-protocol-spsp')
const ILDCP = require('ilp-protocol-ildcp')
const Exchange = require('ilp-exchange-rate')
const IlpPlugin = require('ilp-plugin')

const PullFunctions = require('./pullfunctions')
const Helpers = require('./helpers')

const defaultAmount = 1
const defaultInterval = 'PT10S'
const defaultCycles = 6
const defaultCap = 'false'

const capTestAmount = 2
const capTestCap = 'true'

const expiryTestCycles = 2
const expiryTestCap = 'true'

class PullTestSuite {
  constructor (deps) {
    this.plugin = IlpPlugin()
    this.pull = deps(PullFunctions)
    this.helpers = deps(Helpers)
  }

  async setup () {
    await this.plugin.connect()
    this.details = await ILDCP.fetch(this.plugin.sendData.bind(this.plugin))
    this.assetCode = this.details.assetCode
    this.assetScale = String(this.details.assetScale - 1)
    this.foreignAssetCode = this.assetCode !== 'EUR' ? 'EUR' : 'USD'
    this.foreignAssetScale = 2
  }

  async testCreatePointer () {
    const testName = 'pointer creation'
    const creation = await this.pull.createPointer({
      amount: defaultAmount,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      interval: defaultInterval,
      cycles: defaultCycles,
      cap: defaultCap })
    if (creation.pointer) {
      this.helpers.success(testName)
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async testQuery () {
    const testName = 'pointer querying'
    const creation = await this.pull.createPointer({
      amount: defaultAmount,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      interval: defaultInterval,
      cycles: defaultCycles,
      cap: defaultCap })
    if (creation.pointer) {
      try {
        await SPSP.query(creation.pointer)
        this.helpers.success(testName)
      } catch (err) {
        this.helpers.simpleError(testName, err.message)
      }
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async testPullMultipleIntervals (n) {
    const testName = `pull ${n} intervals: ${n}*1/10^${this.assetScale} ${this.assetCode}`
    const creation = await this.pull.createPointer({
      amount: defaultAmount,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      interval: defaultInterval,
      cycles: defaultCycles,
      cap: defaultCap })
    if (creation.pointer) {
      if (this.details.clientAddress.startsWith('private') || this.details.clientAddress.startsWith('test') || this.config.productionMode) {
        let pulled = await this.pull.pullMultipleIntervals(creation.pointer, 10, n)
        if (pulled.totalReceived === n * 10) {
          this.helpers.success(testName)
        } else {
          this.helpers.valueError(testName, n * 10, pulled.totalReceived, pulled.message)
        }
      } else {
        this.helpers.productionWarning(testName)
      }
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async testPullDifferentCurrency () {
    const testName = 'pull foreign currency'
    const creation = await this.pull.createPointer({
      amount: defaultAmount,
      assetCode: this.foreignAssetCode,
      assetScale: this.foreignAssetScale,
      interval: defaultInterval,
      cycles: defaultCycles,
      cap: defaultCap })
    if (creation.pointer) {
      if (this.details.clientAddress.startsWith('private') || this.details.clientAddress.startsWith('test') || this.config.productionMode) {
        const desiredPullValue = Math.round(await Exchange.fetchRate(this.foreignAssetCode, 2, this.assetCode, this.assetScale))
        if (desiredPullValue) {
          let pulled = await this.pull.pullMultipleIntervals(creation.pointer, Math.ceil(desiredPullValue), 1)
          if (Number(pulled.totalReceived) === desiredPullValue) {
            this.helpers.success(testName)
          } else {
            this.helpers.valueError(testName, Math.ceil(desiredPullValue), pulled.totalReceived, pulled.message)
          }
        } else {
          this.helpers.exchangeError(testName)
        }
      } else {
        this.helpers.productionWarning(testName)
      }
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async testCap () {
    const testName = 'cap'
    const creation = await this.pull.createPointer({
      amount: capTestAmount,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      interval: defaultInterval,
      cycles: defaultCycles,
      cap: capTestCap })
    if (creation.pointer) {
      if (this.details.clientAddress.startsWith('private') || this.details.clientAddress.startsWith('test') || this.config.productionMode) {
        let pulled = await this.pull.pull(creation.pointer, 10)
        await this.helpers.sleep(10000)
        pulled = await this.pull.pull(creation.pointer, 30)
        if (Number(pulled.totalReceived) <= 21 && Number(pulled.totalReceived) >= 20) {
          this.helpers.success(testName)
        } else {
          this.helpers.valueError(testName, 20, pulled.totalReceived, pulled.message)
        }
      } else {
        this.helpers.productionWarning(testName)
      }
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async testExpiry () {
    const testName = 'no refill after expiry'
    const creation = await this.pull.createPointer({
      amount: defaultAmount,
      assetCode: this.assetCode,
      assetScale: this.assetScale,
      interval: defaultInterval,
      cycles: expiryTestCycles,
      cap: expiryTestCap })
    if (creation.pointer) {
      if (this.details.clientAddress.startsWith('private') || this.details.clientAddress.startsWith('test') || this.config.productionMode) {
        let pulled = await this.pull.pullMultipleIntervals(creation.pointer, 10, 3)
        if (pulled.totalReceived === 2 * 10) {
          this.helpers.success(testName)
        } else {
          this.helpers.valueError(testName, 20, pulled.totalReceived, pulled.message)
        }
      } else {
        this.helpers.productionWarning(testName)
      }
    } else {
      this.helpers.simpleError(testName, creation.message)
    }
  }

  async run () {
    await this.setup()
    console.log('Running 7 tests:')
    this.testCreatePointer()
    this.testQuery()
    this.testPullMultipleIntervals(1)
    this.testPullMultipleIntervals(2)
    this.testPullDifferentCurrency()
    this.testCap()
    this.testExpiry()
  }
}

module.exports = PullTestSuite
