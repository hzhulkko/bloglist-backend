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

describe('user listing when there are users in the database', () => {

  test('succeeds when user is logged in', async () => {

    const loginuser = testHelper.initialUsers[2]

    const tokenRequest = await api
      .post('/api/login')
      .send(loginuser)
      .expect(200)
    const token = tokenRequest.body.token

    const response = await api
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.length).toBe(testHelper.initialUsers.length)
  })

  test('fails with error code 401 if user is not logged in', async () => {

    await api
      .get('/api/users')
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

afterAll(() => {
  mongoose.connection.close()
})