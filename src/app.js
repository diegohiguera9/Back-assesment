require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const favRoute = require('./api/fav/fav.route')
const userRoute = require('./api/user/user.route')

const errorHandler = require("./api/middleware/errorHandler");

const app = express()

app.use(cors())
app.use(morgan('tiny'))
app.use(express.json())

app.use('/auth',userRoute)
app.use('/api/favs',favRoute)

app.use(errorHandler)

module.exports = app