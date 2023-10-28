let sharedData = {};

const Member = require('../models/Member');
// const Part = require('../models/Part');
const Saving = require('../models/Saving');
const User = require('../models/User');

const Cluster = require('../models/Cluster');
const Project = require('../models/Project');
const Group = require('../models/Group');

const { dashboardButtons } = require('../controllers/functions/buttons');
const { updateOrgParts, getOrgParts } = require('../controllers/functions/sharedData');

// const updateSharedData = async (userID, authority) => {
//     switch (authority) {
//         case "Admin":
//             sharedData.orgParts = await Cluster.find();
//             break;
//         case "SEDO":
//             sharedData.orgParts = await Cluster.find({ validSEDOs: userID }).populate('project').populate('group').populate('members').populate('savings');
//             break;
//         case "Treasurer":
//             sharedData.orgParts = await Group.find({ validTreasurers: userID }).populate('members').populate('savings');
//             break;
//         default:
//             sharedData.orgParts = null; // Handle the case for an unknown authority
//             break;
//     }
// };


const userController = {
    
    dashboard: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const userID = req.session.userId;
                const sidebar = req.session.sidebar;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;
                let orgParts;
                //admin can see from cluster
                //SEDO can see from project
                //treasurer can see from group

                // needs additional conditions
                // needs update to new schemas 
                var nCluster=0;
                var nProject=0;
                var nGroup=0;
                var nMember=0;
                switch (authority) {
                    case "Admin":
                         nCluster = await Cluster.countDocuments();
                         nProject = await Project.countDocuments();
                         nGroup = await Group.countDocuments();
                         nMember = await Member.countDocuments();
                        break;
                    case "SEDO":
                        orgParts = await Cluster.find({ validSEDOs: userID });
                        break;
                    case "Treasurer":
                        orgParts = await Group.find({ validTreasurers: userID });
                        break;
                    default:
                        break;
                }
                
                // let partWithMembersAndSavings;
                // const orgPartsMembers = [];
                // for (const part of orgParts) {
                //     partWithMembersAndSavings = await Part.findById(part._id).populate('members').populate('savings');
                //     orgPartsMembers.push(partWithMembersAndSavings);
                // }
                //might be matakaw sa memory.
                dashbuttons = dashboardButtons(authority);

                // res.render("dashboard", { authority, orgParts, partWithMembersAndSavings, username  });
                res.render("dashboard", { authority, orgParts, username, dashbuttons, sidebar, nCluster, nProject, nGroup, nMember });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    },

    group: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const userID = req.session.userId;
                const sidebar = req.session.sidebar;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;

                // I assume that we'll make different controllers for each authority
                // so like ibang controller for admin when they acccess a project/group?
                if(authority !== "Treasurer"){
                    return res.status(403).render("fail", { error: "You are not authorized to view this page." });
                }

                //sharedData.orgParts = await Group.find({ validTreasurers: userID }).populate('members').populate('savings');

                // await updateSharedData();
                // let orgParts = sharedData.orgParts;

                const updatedParts = [];
                await updateOrgParts(updatedParts); 
                const orgParts = getOrgParts();

                dashbuttons = dashboardButtons(authority);
                res.render("group", { authority, orgParts, username, dashbuttons, sidebar });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    },

    cluster: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const page = req.params.page;
                const userID = req.session.userId;
                const sidebar = req.session.sidebar;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;
                if(authority !== "Admin"){
                    return res.status(403).render("fail", { error: "You are not authorized to view this page." });
                }
                //sharedData.orgParts = await Cluster.find({ validSEDOs: userID }).populate('project').populate('group').populate('members').populate('savings');

                // await updateSharedData();
                // let orgParts = sharedData.orgParts;

                const updatedParts = await Cluster.find({});
                await updateOrgParts(updatedParts); 
                // const orgParts = getOrgParts();
                const orgParts = updatedParts
                var pageParts = [];
                var perPage = 6; // change to how many clusters per page
                var totalPages;
                if (orgParts.length > perPage) {
                    var startPage = perPage * (page-1);
                    for (var i = 0; i < perPage && (startPage + i < orgParts.length); i++) {
                        pageParts.push(orgParts[startPage + i]);
                    }
                    totalPages = Math.ceil(orgParts.length / perPage);
                } else {
                    pageParts = orgParts;
                    totalPages = 1;
                }
                var totalPages = Math.ceil(orgParts.length/perPage);
                dashbuttons = dashboardButtons(authority);
                res.render("cluster", { authority, pageParts, username, sidebar, dashbuttons, page, totalPages });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    },

    // clusters: async (req, res) => {
    //     try {
    //         if (req.session.isLoggedIn) {
    //             const userID = req.session.userId;
    //             const user = await User.findById(userID);
    //             const authority = user.authority;
    //             const username = user.username;
    //             if(authority !== "Admin"){
    //                 return res.status(403).render("fail", { error: "You are not authorized to view this page." });
    //             }
    //             orgParts = await Cluster.find().populate('project').populate('group').populate('members').populate('savings');

    //             dashbuttons = dashboardButtons(authority);
    //             res.render("clusters", { authority, orgParts, username, dashbuttons, sidebar });
    //         } else {
    //             res.redirect("/");
    //         }
    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).render("fail", { error: "An error occurred while fetching data." });
    //     }
    // },
    member: async (req,res) => {
        try {
            if (req.session.isLoggedIn) {
                const userID = req.session.userId;
                const sidebar = req.session.sidebar;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;

                // await updateSharedData();
                // let orgParts = sharedData.orgParts;

                const updatedParts = [];
                await updateOrgParts(updatedParts); 
                const orgParts = getOrgParts();
                
                dashbuttons = dashboardButtons(authority);
                res.render("member", { authority, username, dashbuttons, sidebar, orgParts });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    },
    profile: async (req,res) => {
        try {
            if (req.session.isLoggedIn) {
                const userID = req.session.userId;
                const sidebar = req.session.sidebar;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;

                dashbuttons = dashboardButtons(authority);
                res.render("profile", { authority, username, dashbuttons, sidebar });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while fetching data." });
        }
    },
    clusterMiddle: async(req,res) => {
        try{
            req.session.clusterId = req.body.id;
            res.status(200).json({ success: true, message: 'Sidebar toggled successfully' });
        }catch(error){
            console.error(error);
        }
    },
    projectMiddle: async(req,res) => {
        try{
            req.session.projectId = req.body.id;
            res.status(200).json({ success: true, message: 'Sidebar toggled successfully' });
        }catch(error){
            console.error(error);
        }
    }
}

module.exports = userController;