const testingRouter = require('express').Router()
const testHelper = require('../tests/test_helper')

testingRouter.post('/init', async (request, response) => {
  await testHelper.initDb()
  response.status(204).end()
})

module.exports = testingRouter