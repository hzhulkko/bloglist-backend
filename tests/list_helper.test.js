const mongoose = require('mongoose')
const listHelper = require('../utils/list_helper')
const testHelper = require('./test_helper')

test('when list has only one blog equals the likes of that', () => {
  const listWithOneBlog = [
    {
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
      likes: 5,

    }
  ]
  const result = listHelper.totalLikes(listWithOneBlog)
  expect(result).toBe(5)
})


test('when list is empty total likes is zero', () => {
  const emptylist = []
  const result = listHelper.totalLikes(emptylist)
  expect(result).toBe(0)
})


describe('blog statistics calculations', () => {

  const blogs = testHelper.initialBlogs

  test('when multiple blogs exist total likes is sum of all likes', () => {
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(15)

  })

  test('favoriteBlog returnes the blog with most likes', () => {
    const expectedResult = {
      title: 'Title 5',
      author: 'Author B',
      likes: 5
    }
    const actualResult = listHelper.favoriteBlog(blogs)
    expect(actualResult).toEqual(expectedResult)
  })

  test('mostBlogs returns the author with most blogs', () => {
    const expectedResult = {
      author: 'Author A',
      blogs: 3
    }
    const actualResult = listHelper.mostBlogs(blogs)
    expect(actualResult).toEqual(expectedResult)
  })

  test('mostLikes returns the author with most likes', () => {
    const expectedResult = {
      author: 'Author B',
      likes: 7
    }
    const actualResult = listHelper.mostLikes(blogs)
    expect(actualResult).toEqual(expectedResult)
  })

})

afterAll(() => {
  mongoose.connection.close()
})