const SPSP = require('ilp-protocol-spsp')
const ILDCP = require('ilp-protocol-ildcp')
const Exchange = require('ilp-exchange-rate')
const IlpPlugin = require('ilp-plugin')
const reduct = require('reduct')
const moment = require('moment')

const PullFunctions = require('../src/pullfunctions')

const productionMode = process.env.PRODUCTION === 'true'
const defaultInterval = process.env.PULL_POINTER_INTERVAL || 'PT10S'

const defaultAmount = 1
const defaultCycles = 10
const defaultCap = 'false'
const foreignAssetScale = 2

let scaleTestScale

const capTestAmount = 2
const capTestCap = 'true'

const expiryTestCycles = 2
const expiryTestCap = 'true'

let assetCode
let assetScale
let foreignAssetCode

const pullFunctions = reduct()(PullFunctions)
const plugin = IlpPlugin()

beforeAll(async () => {
  await plugin.connect()
  const details = await ILDCP.fetch(plugin.sendData.bind(plugin))
  assetCode = details.assetCode
  assetScale = String(details.assetScale)
  scaleTestScale = assetScale - 1
  foreignAssetCode = assetCode !== 'EUR' ? 'EUR' : 'USD'

  if (!details.clientAddress.startsWith('private') && !details.clientAddress.startsWith('test') && !productionMode) {
    await plugin.disconnect()
    process.exit(1)
  }
})

afterAll(async () => {
  await plugin.disconnect()
})

test('Create pull pointer', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  expect(creation.pointer).toBeDefined()
})

test('Query pull pointer', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  const query = await SPSP.query(creation.pointer)
  expect(query.destination_account).toBeDefined()
  expect(query.shared_secret).toBeDefined()
})

test('Pull once from pull pointer', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, defaultAmount, defaultInterval, 1)
  expect(pull.totalReceived).toBe(1)
})

test('Pull twice from pull pointer', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, defaultAmount, defaultInterval, 2)
  expect(pull.totalReceived).toBe(2)
}, moment.duration(defaultInterval).as('milliseconds') * 2 + 10000)

test('Pull different asset scale', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: scaleTestScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, defaultAmount * 10, defaultInterval, 1)
  expect(pull.totalReceived).toBe(10)
})

test('Pull different currency', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: foreignAssetCode,
    assetScale: foreignAssetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: defaultCap
  })
  const rate = await Exchange.fetchRate(foreignAssetCode, foreignAssetScale, assetCode, assetScale)
  const desiredPullValue = Math.ceil(rate)
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, desiredPullValue, defaultInterval, 1)
  expect(pull.totalReceived).toBe(desiredPullValue)
}, moment.duration(defaultInterval).as('milliseconds') + 10000)
// TODO: does not exit correctly

test('Pull using a cap', async () => {
  const creation = await pullFunctions.createPointer({
    amount: capTestAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: defaultCycles,
    cap: capTestCap
  })
  const pull = await pullFunctions.pullMultipleAmounts(creation.pointer, [1, 3], defaultInterval)
  expect(pull.totalReceived).toBe(3)
}, moment.duration(defaultInterval).as('milliseconds') * 2 + 10000)

test('Pull after expiry', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: expiryTestCycles,
    cap: expiryTestCap
  })
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, defaultAmount, defaultInterval, 3)
  expect(pull.totalReceived).toBe(2)
}, 40000)
