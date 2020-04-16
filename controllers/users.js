const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
  jwt.verify(request.token, process.env.SECRET)
  const users = await User
    .find({})
    .populate('blogs', { title : 1, author: 1, url: 1 })
  return response.json(users)
})

userRouter.post('/', async (request, response) => {
  const body = request.body

  if (!body.password || body.password.length < 3) {
    return response.status(400).send({ error: 'password must be at least 3 characters' })
  }

  const rounds = 10
  const passwordHash = await bcrypt.hash(body.password, rounds)

  const user = new User({
    username: body.username,
    name: body.name,
    passwordHash
  })

  const createdUser = await user.save()
  response.status(201).json(createdUser)

})

userRouter.get('/:id', async (request, response) => {
  jwt.verify(request.token, process.env.SECRET)
  const user = await User
    .findById(request.params.id)
    .populate('blogs', { title : 1, author: 1, url: 1 })
  if (!user) {
    return response.status(404).send({ error: 'user not found' })
  }
  return response.json(user)
})

module.exports = userRouter