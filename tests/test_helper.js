const bcrypt = require('bcrypt')
const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  { title: 'Title 1', author: 'Author A', likes: 1, url: 'http://some.url' },
  { title: 'Title 2', author: 'Author B', likes: 2, url: 'http://some.url' },
  { title: 'Title 3', author: 'Author C', likes: 3, url: 'http://some.url' },
  { title: 'Title 4', author: 'Author A', likes: 4, url: 'http://some.url' },
  { title: 'Title 5', author: 'Author B', likes: 5, url: 'http://some.url' },
  { title: 'Title 6', author: 'Author A', likes: 0, url: 'http://some.url' }
]

const initialUsers = [
  {
    name: 'Superuser',
    username: 'root',
    password: 'secret'
  },
  {
    name: 'Test User',
    username: 'testuser',
    password: 'secret'
  },
  {
    name: 'Login User',
    username: 'loginuser',
    password: 'secret'
  }
]

const createLoginUser = async () => {
  const loginuser = await User.findOne({ username: initialUsers[2].username })
  const passwordHash = await bcrypt.hash(initialUsers[2].password, 10)
  loginuser.passwordHash = passwordHash
  await loginuser.save()
}

const initDb = async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})
  await User.insertMany(initialUsers)
  const superuser = await User.findOne({ username: initialUsers[0].username })
  const testuser = await User.findOne({ username: initialUsers[1].username })
  let suBlogs = initialBlogs
    .filter(blog => blog.likes % 2 === 0)
    .map(blog => ({ ...blog, user: superuser._id }))
  let tuBlogs = initialBlogs
    .filter(blog => blog.likes%2 === 1)
    .map(blog => ({ ...blog, user: testuser._id }))
  await Blog.insertMany(suBlogs)
  await Blog.insertMany(tuBlogs)
  const blogs = await Blog.find({})
  suBlogs = blogs.filter(blog => blog.user.toString() === superuser._id.toString())
  tuBlogs = blogs.filter(blog => blog.user.toString() === testuser._id.toString())
  superuser.blogs = suBlogs.map(b => b._id)
  testuser.blogs = tuBlogs.map(b => b._id)
  await superuser.save()
  await testuser.save()
  await createLoginUser()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}
module.exports = { initialBlogs, initDb, blogsInDb, usersInDb }