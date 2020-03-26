const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const testHelper = require('./test_helper')

const api = supertest(app)

beforeEach(async () => {
  await testHelper.initDb()
})

describe('when there are blogs in the database', () => {

  test('blogs are return in json format', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs in the database are listed', async () => {
    const response = await api.get('/api/blogs')
    expect(response.body.length).toBe(testHelper.initialBlogs.length)
  })

  test('returned blogs have an attribute id', async () => {
    const response = await api.get('/api/blogs')
    response.body.forEach(body => expect(body.id).toBeDefined())
  })

  describe('adding a blog', () => {

    test('succeeds with valid data', async () => {
      const blogToAdd = { title: 'Title 7', author: 'Author C', likes: 1, url: 'some.url' }
      await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(201)
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length + 1)
      const titles = resultingBlogs.map(blog => blog.title)
      expect(titles).toContain(blogToAdd.title)
    })

    test('the new blog has 0 likes if likes are not given', async () => {
      const blogToAdd = { title: 'Title 7', author: 'Author C', url: 'some.url' }
      await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(201)
      const resultingBlogs = await testHelper.blogsInDb()
      const addedBlog = resultingBlogs.find(blog => blog.title === blogToAdd.title)
      expect(addedBlog).toHaveProperty('likes')
      expect(addedBlog.likes).toBe(0)
    })

    test('fails with status code 400 if title is missing', async () => {
      const blogToAdd = { author: 'Author C', likes: 1, url: 'some.url' }
      await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(400)
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const blogToAdd = { title: 'Title 7', author: 'Author C', likes: 1 }
      await api
        .post('/api/blogs')
        .send(blogToAdd)
        .expect(400)
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length)
    })

  })

  describe('deleting a blog', () => {

    test('succeeds with status code 204 when id is valid', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const existingBlog = blogsAtStart.pop()
      await api
        .delete(`/api/blogs/${existingBlog.id}`)
        .expect(204)
      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).not.toContainEqual(existingBlog)
    })

  })

  describe('updating a blog', () => {

    test('succeeds with valid id', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const oldBlog = blogsAtStart.pop()
      const update = {
        title: 'A New Title',
        author: oldBlog.author,
        url: oldBlog.url,
        likes: oldBlog.likes + 10
      }
      await api
        .put(`/api/blogs/${oldBlog.id}`)
        .send(update)
        .expect(200)
      const blogsAtEnd = await testHelper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(blog => blog.id === oldBlog.id)
      expect(updatedBlog.title).toBe(update.title)
      expect(updatedBlog.likes).toBe(update.likes)

    })

  })


})

afterAll(() => {
  mongoose.connection.close()
})


