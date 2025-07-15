const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticate = require('../middleware/authenticate');

router.post('/userAuth',userController.userAuth);


module.exports = router;