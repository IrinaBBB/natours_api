const dotenv = require('dotenv')
dotenv.config({
    path: './config.env',
})

const mongoose = require('mongoose')
const app = require('./app.js')

const DB = process.env.DATABASE
mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.error('DB connection error:', err))

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`App running on port ${port}`)
})