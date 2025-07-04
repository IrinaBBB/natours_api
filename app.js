const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes.js')
const userRouter = require('./routes/userRoutes.js')
const qs = require('qs')

const app = express()
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.set('query parser', (str) => qs.parse(str))
app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use((req, res, next) => {
    console.log('hello from middleware')
    next()
})
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)


module.exports = app