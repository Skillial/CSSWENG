const express = require('express');
const router = express.Router();
const he = require("he");
const mongoose = require('mongoose');

//const Loan = require('../models/Loan')
const Member = require('../models/Member');
const Part = require('../models/Part');
const Saving = require('../models/Saving');
const User = require('../models/User');

const partController = require('../controllers/partController.js');

router.post("/group", partController.newGroup);
router.post("/project", partController.newProject);
router.post("/cluster", partController.newCluster);

router.get('/groups/:id', partController.retrieveGroup);
router.post('/groups/:id/edit', partController.editGroup);
router.post('/groups/:id/delete', partController.deleteGroup);

router.get('/projects/:id', partController.retrieveProject);
router.post('/projects/:id/edit', partController.editProject);
router.post('/projects/:id/delete', partController.deleteProject);

router.get('/clusters/:id', partController.retrieveCluster);
router.post('/clusters/:id/edit', partController.editCluster);
router.post('/clusters/:id/delete', partController.deleteCluster);

//alternative if we want to do it by name. will have to change some code in the controllers
// router.post("/group", partController.newGroup);
// router.post("/project", partController.newProject);
// router.post("/cluster", partController.newCluster);

// router.get('/groups/:name', partController.retrieveGroup);
// router.post('/groups/:name/edit', partController.editGroup);
// router.post('/groups/:name/delete', partController.deleteGroup);

// router.get('/projects/:name', partController.retrieveProject);
// router.post('/projects/:name/edit', partController.editProject);
// router.post('/projects/:name/delete', partController.deleteProject);


module.exports = router;  
