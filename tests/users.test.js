const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const testHelper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await testHelper.initDb()
})

describe('user creation when there are users in the database', () => {

  test('succeeds with valid username and password', async () => {
    const userToCreate = {
      name: 'New User',
      username: 'newuser',
      password: 'secret'
    }
    await api
      .post('/api/users')
      .send(userToCreate)
      .expect(201)
      .expect('Content-Type', /application\/json/)

  })

  test('fails with status code 400 and appropriate error message if username exists', async () => {
    const userToCreate = {
      name: 'New User',
      username: 'testuser',
      password: 'secret'
    }
    const response = await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('`username` to be unique')

  })

  test('fails with status code 400 and appropriate error message if password is too short', async () => {
    const userToCreate = {
      name: 'New User',
      username: 'newuser',
      password: 'se'
    }
    const response = await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('password must be at least 3 characters')

  })

  test('fails with status code 400 and appropriate error message if username is too short', async () => {
    const userToCreate = {
      name: 'New User',
      username: 'ne',
      password: 'secret'
    }
    const response = await api
      .post('/api/users')
      .send(userToCreate)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain(`\`username\` (\`${userToCreate.username}\`) is shorter than`)

  })

})

afterAll(() => {
  mongoose.connection.close()
})