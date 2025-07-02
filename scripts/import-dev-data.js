const mongoose = require('mongoose')
const dotenv = require('dotenv')
const fs = require('fs')
const Tour = require('./../models/tourModel.js')
dotenv.config({
    path: './config.env',
})


const tours = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`, 'utf-8'))

const DB = process.env.DATABASE
mongoose
    .connect(DB)
    .then(() => console.log('DB connection successful!'))
    .catch((err) => console.error('DB connection error:', err))


const importData = async () => {
    try {
        await Tour.create(tours)
        console.log('Data successfully loaded!')
    } catch (e) {
        console.log(e)
    }
    process.exit()
}

const deleteData = async () => {
    try {
        await Tour.deleteMany()
        console.log('Data successfully deleted!')
    } catch (e) {
        console.log(e)
    }
    process.exit()
}

if (process.argv[2] === '--import') {
    importData().then()
} else if (process.argv[2] === '--delete') {
    deleteData().then()
}

