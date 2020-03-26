const Blog = require('../models/blog')

const initialBlogs = [
  { title: 'Title 1', author: 'Author A', likes: 1, url: 'http://some.url' },
  { title: 'Title 2', author: 'Author B', likes: 2, url: 'http://some.url' },
  { title: 'Title 3', author: 'Author C', likes: 3, url: 'http://some.url' },
  { title: 'Title 4', author: 'Author A', likes: 4, url: 'http://some.url' },
  { title: 'Title 5', author: 'Author B', likes: 5, url: 'http://some.url' },
  { title: 'Title 6', author: 'Author A', likes: 0, url: 'http://some.url' }
]

const initDb = async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(initialBlogs)
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

module.exports = { initialBlogs, initDb, blogsInDb }