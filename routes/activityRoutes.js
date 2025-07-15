const express = require('express');
const router = express.Router();
const actController = require('../controller/activityController');
const authenticate = require('../middleware/authenticate');

router.post('/addActivity',authenticate,actController.addActivity);
router.get('/Activities',authenticate,actController.getActivities);
router.put('/updateAct/:id_activity',actController.updateActivity);
router.get('/detailAct/:id_activity',actController.ActivityDetail)

module.exports = router;