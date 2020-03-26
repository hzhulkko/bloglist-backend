const bcrypt = require('bcrypt')
const userRouter = require('express').Router()
const User = require('../models/user')

userRouter.get('/', async (request, response) => {
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

module.exports = userRouter