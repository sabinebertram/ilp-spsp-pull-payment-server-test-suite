const SPSP = require('ilp-protocol-spsp')
const ILDCP = require('ilp-protocol-ildcp')
const Exchange = require('ilp-exchange-rate')
const IlpPlugin = require('ilp-plugin')
const reduct = require('reduct')

const PullFunctions = require('../src/pullfunctions')
const Helpers = require('../src/helpers')

const defaultAmount = 1
const defaultInterval = 'PT10S'
const defaultCycles = 6
const defaultCap = 'false'
const foreignAssetScale = 2

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
  assetScale = String(details.assetScale - 1)
  foreignAssetCode = assetCode !== 'EUR' ? 'EUR' : 'USD'
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
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, 10, 1)
  expect(pull.totalReceived).toBe(10)
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
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, 10, 2)
  expect(pull.totalReceived).toBe(20)
}, 20000)

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
  const desiredPullValue = Math.ceil(rate * 10)
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, desiredPullValue, 1)
  expect(pull.totalReceived).toBe(desiredPullValue)
}, 12000)
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
  const pull = await pullFunctions.pullMultipleAmounts(creation.pointer, [10, 30])
  expect(pull.totalReceived).toBe(30)
}, 25000)

test('Pull test expiry', async () => {
  const creation = await pullFunctions.createPointer({
    amount: defaultAmount,
    assetCode: assetCode,
    assetScale: assetScale,
    interval: defaultInterval,
    cycles: expiryTestCycles,
    cap: expiryTestCap
  })
  const pull = await pullFunctions.pullMultipleIntervals(creation.pointer, 10, 3)
  expect(pull.totalReceived).toBe(20)
}, 40000)
