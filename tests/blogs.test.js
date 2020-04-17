const mongoose = require('mongoose')
const app = require('../app')
const supertest = require('supertest')
const testHelper = require('./test_helper')

const api = supertest(app)
let token = null

const getToken = async () => {
  const loginuser = testHelper.initialUsers[2]
  const response = await api
    .post('/api/login')
    .send(loginuser)
    .expect(200)
  return response.body.token
}

beforeEach(async () => {
  await testHelper.initDb()
  token = await getToken()
})

describe('when there are blogs in the database', () => {

  test('blogs are return in json format', async () => {
    await api
      .get('/api/blogs')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs in the database are listed', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    expect(response.body.length).toBe(testHelper.initialBlogs.length)
  })

  test('returned blogs have an attribute id', async () => {
    const response = await api.get('/api/blogs').set('Authorization', `Bearer ${token}`)
    response.body.forEach(body => expect(body.id).toBeDefined())
  })

  describe('getting a blog', () => {
    test('succeeds if the id exists ', async () => {
      const blogs = await testHelper.blogsInDb()
      const blog = blogs[0]
      const response = await api.get(`/api/blogs/${blog.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)
      expect(response.body.title).toBe(blog.title)
      expect(response.body.author).toBe(blog.author)
      expect(response.body.url).toBe(blog.url)
      expect(response.body.user.id).toBe(blog.user.toString())
    })

    test('fails with status code 404 if the id does not exist', async () => {
      const response = await api.get('/api/blogs/5e96b9678abe26628aab4818')
        .set('Authorization', `Bearer ${token}`)
        .expect(404)
        .expect('Content-Type', /application\/json/)
      expect(response.body.error).toBe('blog not found')
    })
  })



  describe('adding a blog', () => {

    test('succeeds with valid data', async () => {
      const blogToAdd = { title: 'Title 7', author: 'Author C', likes: 1, url: 'some.url' }
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
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
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(400)
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length)
    })

    test('fails with status code 400 if url is missing', async () => {
      const blogToAdd = { title: 'Title 7', author: 'Author C', likes: 1 }
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blogToAdd)
        .expect(400)
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length)
    })

    test('fails with status code 401 with invalid token', async () => {
      const invalidToken = 'abcdefgh'
      const blogToAdd = { title: 'Title 7', author: 'Author C', likes: 1 }
      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send(blogToAdd)
        .expect(401)
      expect(response.body.error).toContain('invalid token')
      const resultingBlogs = await testHelper.blogsInDb()
      expect(resultingBlogs.length).toBe(testHelper.initialBlogs.length)
    })

  })

  describe('deleting a blog', () => {

    test('succeeds with status code 204 when id is valid and user is correct', async () => {
      // First add a blog for loginuser
      const blog = { title: 'Blog To Delete', author: 'Author C', likes: 1, url: 'some.url' }
      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${token}`)
        .send(blog)
        .expect(201)
      const blogsAtStart = await testHelper.blogsInDb()
      const existingBlog = blogsAtStart.find(b => b.title === blog.title)
      await api
        .delete(`/api/blogs/${existingBlog.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(204)
      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).not.toContainEqual(existingBlog)
    })

    test('fails with status code 204 when id is valid but user is incorrect', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const existingBlog = blogsAtStart.pop()
      const response = await api
        .delete(`/api/blogs/${existingBlog.id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(401)
      expect(response.body.error).toBe('unauthorized')
      const blogsAtEnd = await testHelper.blogsInDb()
      expect(blogsAtEnd).toContainEqual(existingBlog)
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
        .set('Authorization', `Bearer ${token}`)
        .send(update)
        .expect(200)
      const blogsAtEnd = await testHelper.blogsInDb()
      const updatedBlog = blogsAtEnd.find(blog => blog.id === oldBlog.id)
      expect(updatedBlog.title).toBe(update.title)
      expect(updatedBlog.likes).toBe(update.likes)

    })

  })

  describe('commenting on a blog', () => {

    test('succeeds with valid id', async () => {
      const blogsAtStart = await testHelper.blogsInDb()
      const blogToComment = blogsAtStart.pop()
      const comment = { comment: 'awesome!' }
      const response = await api
        .post(`/api/blogs/${blogToComment.id}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send(comment)
        .expect(200)
      expect(response.body.comments).toContain(comment.comment)
    })

    test('fails with status code 404 if id does not exists', async () => {
      const comment = { comment: 'awesome!' }
      const response = await api
        .post('/api/blogs/5e96b9678abe26628aab4818/comments')
        .set('Authorization', `Bearer ${token}`)
        .send(comment)
        .expect(404)
      expect(response.body.error).toBe('blog not found')
    })
  })


})

afterAll(() => {
  mongoose.connection.close()
})


