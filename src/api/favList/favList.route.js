const { isAuthenticated } = require("../middleware/auth")
const favListController = require("./favList.controller")
const router = require("express").Router()

router.route('/').post(isAuthenticated,favListController.create)
router.route('/').get(isAuthenticated,favListController.showAll)
router.route('/:id').get(isAuthenticated,favListController.show)
router.route('/:id').delete(isAuthenticated,favListController.delete)

module.exports = router
