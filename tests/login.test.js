const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const testHelper = require('./test_helper')
const api = supertest(app)

beforeEach(async () => {
  await testHelper.initDb()
})

describe('when existing user logs in', () => {
  test('token is returned when username and password are correct', async () => {
    const user = { username: 'loginuser', password: 'secret' }
    const response = await api
      .post('/api/login')
      .send(user)
      .expect(200)
    expect(response.body.token).toBeDefined()
    expect(response.body.username).toBe(user.username)
  } )
})

afterAll(async () => {
  mongoose.connection.close()
})