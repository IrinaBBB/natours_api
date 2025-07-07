// 🌐 Core & Third-Party Modules
const express = require('express')
const morgan = require('morgan')
const qs = require('qs')

// 📦 Custom Utilities & Middleware
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controllers/errorController.js')

// 🚦 Route Handlers
const tourRouter = require('./routes/tourRoutes.js')
const userRouter = require('./routes/userRoutes.js')


const app = express()
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}
app.set('query parser', (str) => qs.parse(str))
app.use(express.json())
app.use(express.static(`${__dirname}/public`))
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})


app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('/{*any}', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404))
})

app.use(globalErrorHandler)

module.exports = app