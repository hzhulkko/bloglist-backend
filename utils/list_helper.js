const _ = require('lodash')

const totalLikes = (blogs) => {
  const reducer = (sum, blog) => sum + blog.likes
  return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
  const reducer = (prev, curr) => (prev.likes <= curr.likes) ? curr : prev
  const mostLikes = blogs.reduce(reducer)
  return {
    title: mostLikes.title,
    author: mostLikes.author,
    likes: mostLikes.likes
  }
}

const mostBlogs = (blogs) => {
  const mapper = (value, key) => {
    return {
      author: key,
      blogs: value.length
    }
  }
  const reducer = (prev, curr) => (prev.blogs <= curr.blogs) ? curr : prev
  return _.map(_.groupBy(blogs, 'author'), mapper).reduce(reducer)
}

const mostLikes = (blogs) => {
  const mapper = (value, key) => {
    return {
      author: key,
      likes: totalLikes(value)
    }
  }
  const reducer = (prev, curr) => (prev.likes <= curr.likes) ? curr : prev
  return _.map(_.groupBy(blogs, 'author'), mapper).reduce(reducer)

}

module.exports = {
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}