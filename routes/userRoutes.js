const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const authenticate = require('../middleware/authenticate');

router.put('/updateUser',authenticate,userController.updateUserInfo)
router.post('/register',userController.register);
router.post('/login',userController.login);
router.get('/user',authenticate,userController.userDetail);

module.exports = router;    