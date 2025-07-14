// 🌐 Core & Third-Party Modules
const express = require('express')
const morgan = require('morgan')
const qs = require('qs')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xxs = require('xss-clean')
const hpp = require('hpp')

// 📦 Custom Utilities & Middleware
const AppError = require('./utils/appError.js')
const globalErrorHandler = require('./controllers/errorController.js')

// 🚦 Route Handlers
const tourRouter = require('./routes/tourRoutes.js')
const userRouter = require('./routes/userRoutes.js')


const app = express()
app.use(helmet())

app.use((req, res, next) => {
    Object.defineProperty(req, 'query', {
        ...Object.getOwnPropertyDescriptor(req, 'query'),
        value: req.query,
        writable: true,
    })
    next()
})

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
})

app.use(limiter)

app.set('query parser', (str) => qs.parse(str))
// app.use(express.json({ limit: '10k' }))
app.use(express.json())

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize())

// Data Sanitization against XSS
app.use(xxs())

// Prevent parameter pollution
// app.use(hpp({
//     whitelist: [
//         'duration',
//         'ratingsQuality',
//         'ratingsAverage',
//         'maxGroupSize',
//         'difficulty',
//         'price',
//     ],
// }))

app.use(hpp())

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