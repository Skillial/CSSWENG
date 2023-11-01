const express = require('express');
const router = express.Router();
const he = require("he");
const mongoose = require('mongoose');

//const Loan = require('../models/Loan')
const Member = require('../models/Member');
const Part = require('../models/Part');
const Saving = require('../models/Saving');
const User = require('../models/User');

const userController = require('../controllers/userController');

router.get("/dashboard", userController.dashboard);

router.get("/cluster/view/:page", userController.cluster);
// router.get("/member", userController.member);
router.get("/profile", userController.profile);
router.post("/clusterMiddle",userController.clusterMiddle);
router.post("/projectMiddle",userController.projectMiddle);
router.post("/groupMiddle",userController.groupMiddle);
module.exports = router;  