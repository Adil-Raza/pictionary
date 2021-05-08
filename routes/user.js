const express = require('express')
const router = express.Router()

const {
  userGet
} = require('../controllers/userController')

router.get('/', userGet)

module.exports = router
