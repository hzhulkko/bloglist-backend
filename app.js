const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const blogsRouter = require('./controllers/blogs')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const testingRouter = require('./controllers/testing')
const middleware = require('./utils/middleware')

mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)

const mongoUrl = `mongodb://${config.MONGODB_URI}`
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(succ => console.log('Connected to database'))
  .catch(error => {
    console.log('Connection failed', error)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtractor)
app.use('/api/login', loginRouter)
app.use('/api/users', userRouter)
app.use('/api/blogs', blogsRouter)
if (process.env.NODE_ENV === 'test') {
  app.use('/api/test', testingRouter)
}
app.use(middleware.errorHandler)

module.exports = app