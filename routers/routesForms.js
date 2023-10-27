const express = require('express');
const router = express.Router();

const Member = require('../models/Member');
const Part = require('../models/Part');
const Saving = require('../models/Saving');
const User = require('../models/User');
const Cluster = require('../models/Cluster');

const formsController = require('../controllers/formsController');

//ACTUAL ROUTES TO BE USED
router.get('/editClusterForm/:clusterName', formsController.loadEditClusterForm);
router.get('/editSubProjectsForm/:projectName', formsController.loadEditSubProjectsForm);
router.get('/editSHGForm/:shgName', formsController.loadEditSHGForm);
module.exports = router;