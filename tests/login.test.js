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
  })

  test('login fails with status code 401 with wrong password', async () => {
    const user = { username: 'loginuser', password: 'password' }
    await api
      .post('/api/login')
      .send(user)
      .expect(401)
  })
})

afterAll(async () => {
  mongoose.connection.close()
})