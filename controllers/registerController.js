const User = require('../models/User');

const mongoose = require('mongoose')

const registerController = {

    register: async (req, res) => {
        if(req.session.isLoggedIn){
            try {
              const loggedInUser = await User.findById(req.session.userId);
              if (loggedInUser.authority !== 'Admin') {
                  return res.status(401).json({ error: "Only admins can register new accounts." });
              }
      
              const { username, password, repassword, authority, validPart } = req.body;
              if (password !== repassword) {
                return res.status(400).json({ error: "Passwords do not match." });
              }
          
              //checking inputs for other stuff
              const MIN_PASSWORD_LENGTH = 6; 
              const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/; 
              if (password.length < MIN_PASSWORD_LENGTH || !passwordRegex.test(password)) {
                return res.status(400).json({ error: "Password must be at least 6 characters long and must contain upper and lowercase lettes, and numbers." });
              }
          
              let usernameRegex = /^(?=.{3,15}$)(?=.*[a-zA-Z0-9])[a-zA-Z0-9_-]*$/;
              if (!usernameRegex.test(username)) {
                return res.status(400).json( { error: "Username must contain at least one letter or number, and be between 3-15 characters long, and cannot be 'visitor'!" });
              }
              
              const existingUser = await User.findOne({ username });
              if (existingUser) {
                return res.status(400).json( { error:"Username already exists"});
              }
      
              let validParts = [];
              //get the children of validPart (if SEDO)
              if (authority === "SEDO") {
                    const cluster = await Part.findById(validPart);
      
                    validParts.push(cluster._id);
      
                    const projects = await Part.find({ parentPart: cluster._id, type: 'Project' });
                    projects.forEach(project => {
                        // Add Project IDs
                        validParts.push(project._id);
      
                        // Retrieve groups that belong to the project
                        const groups = project.childPart.filter(partId => partId.type === 'Group');
                        // Add Group IDs
                        validParts.push(group._id);
                    });
                    
              }else{
                validParts = validPart;
              }
              
              const user = new User({ username, password, authority, validParts });
              const savedUser = await user.save();
              savedUser.userId = savedUser._id;
              await savedUser.save();
          
              res.redirect("/success");
            } catch (error) {
              console.error(error);
              return res.status(500).json( { error: "An error occured, please try again" });
            }
          }else{
            res.redirect("/") //res.render("/") , redirect back to homepage (aka login page)
          }
        }
}

module.exports = registerController;