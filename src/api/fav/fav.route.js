const favController = require('./fav.controller')
const router = require('express').Router()
const {isAuthenticated} = require('../middleware/auth')

router.route('/').post(isAuthenticated,favController.create)
router.route('/').get(isAuthenticated,favController.showAll)
router.route('/:id').get(isAuthenticated,favController.show)
router.route('/:id').delete(isAuthenticated,favController.delete)

module.exports = router