require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const userRoute = require('./api/user/user.route')
const favListRoute = require('./api/favList/favList.route')

const errorHandler = require("./api/middleware/errorHandler");

const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())

app.use('/auth',userRoute)
app.use('/api/favs',favListRoute)

app.use(errorHandler)

module.exports = app