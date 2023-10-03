const User = require("../models/User");
const Part = require("../models/Part");

const userController = {
    
    dashboard: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const userID = req.session.userId;
                const user = await User.findById(userID);
                const authority = user.authority;
                // const username = user.username;
                let orgParts;
        
                if (authority === "Admin") {
                    orgParts = await Part.find();
                } else if (authority === "SEDO" || authority === "Treasurer") {
                    const validOrg = user.validOrg; 
                    orgParts = await Part.find({ _id: { $in: validOrg } });
                    //maybe we could just have the topmost accessible thing for SEDO then recursively get all other things that the user can access
                    //i think that's extra read processes though (recursion) as opposed to just checcking everything once...? 
                    //i mean this current solution isnt O(n^2) naman

                    //  as for additional security, maybe RBAC? but i think that's something very complex and im not sure where to start on that
                }
                //get members of orgParts
                //total values are in the Parts schema
                res.render("dashboard", { authority, orgParts });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    }
}

module.exports = userController;