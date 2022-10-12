const router = require('express').Router()
const userController = require('./user.controller')

router.route('/local/singup').post(userController.create)
router.route('/local/login').post(userController.login)

module.exports = router