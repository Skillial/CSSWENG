const express = require('express');
const router = express.Router();

const Member = require('../models/Member');
const Part = require('../models/Part');
const Saving = require('../models/Saving');
const User = require('../models/User');

//This is one just to render the forms in a separate page
router.get("/addUser", async (req, res) => {
    if(req.session.isLoggedIn){
        const user = await User.findById(req.session.userId);
        const authority = user.authority;

        res.render("popup", { authority });
    }
    else
        res.redirect("/");
});

//This one changes the form depending on the user type selected
router.post("/addUser", async (req, res) => {
    res.render("components/addUser", { userType: req.body.userType });
});

module.exports = router;