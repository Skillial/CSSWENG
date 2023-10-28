const Member = require('../models/Member');
const Saving = require('../models/Saving');
const User = require('../models/User');

const Cluster = require('../models/Cluster');
const Project = require('../models/Project');
const Group = require('../models/Group');
const { project } = require('./userController');
const { updateOrgParts, getOrgParts } = require('../controllers/functions/sharedData');
const { dashboardButtons } = require('../controllers/functions/buttons');

const partController = {
    //create a new group
    newGroup: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                // im imagining what the form will have
                // i think we can get SPU from projects? or maybe we can just have a dropdown of SPUs? or manually input?

                const projectId = req.session.projectId; // [TO UPDATE MAYBE]
                console.log(projectId);
                let project = await Project.findById(projectId);

                const { SPU, name, area, depositoryBank, bankAccountType, bankAccountNum, 
                    signatory_firstName, signatory_middleName, signatory_lastName, 
                    other_firstName, other_middleName, other_lastName, other_contactNo } = req.body;

                // req.body.SPU = project.name; //maybe change this to project name?

                const existingGroup = await Group.findOne({ SPU, name, area });
                if (existingGroup) {
                    return res.status(400).json({ error: "A group with the same name, area, and SPU already exists." });
                }
            
                const signatories = [];
                for (let i = 0; i < signatory_firstName.length; i++) {
                    signatories.push({
                        firstName: signatory_firstName[i],
                        middleName: signatory_middleName[i],
                        lastName: signatory_lastName[i]
                    });
                }
                
                const otherPeople = [];
                for (let i = 0; i < other_firstName.length; i++) {
                    otherPeople.push({
                        firstName: other_firstName[i],
                        middleName: other_middleName[i],
                        lastName: other_lastName[i],
                        contactNo: [other_contactNo[i]]
                    });
                }
                
                const newGroup = new Group({
                    SPU,
                    name,
                    area,
                    depositoryBank,
                    bankAccountType,
                    bankAccountNum,
                    signatories,
                    otherPeople
                });
                await newGroup.save();

                project.groups.push(newGroup._id);
                await project.save();

                //redirecting to dashboard rn cuz idk where else to redirect to
                res.redirect("/dashboard");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while creating a new group." });
        }
    },
    
    retrieveGroup: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const groupId = req.params.id; 
                // idk if this works will fix in future
    
                const group = await Group.findById(groupId)
                    // .populate('members').populate('savings');
                    // im thinking this only loads the actual group info and not the members and savings yet
                    // this is for like preloading current info into the edit form, then the function below is for actually editing the group (editGroup)
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);


                if (!group) {
                    return res.status(404).render("fail", { error: "Group not found." });
                }

                res.render("editGroup", { group });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while retrieving group information." });
        }
    },


    // edit group
    editGroup: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const groupId = req.params.id;
                const group = await Group.findById(groupId);
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);


                const { SPU, name, area, depositoryBank, bankAccountType, bankAccountNum, 
                    signatory_firstName, signatory_middleName, signatory_lastName, 
                    other_firstName, other_middleName, other_lastName, other_contactNo } = req.body;
                
                const existingGroup = await Group.findOne({ SPU, name, area });
                if (existingGroup) {
                    return res.status(400).json({ error: "A group with the same name, area, and SPU already exists." });
                }
                
                const signatories = [];
                for (let i = 0; i < signatory_firstName.length; i++) {
                    signatories.push({
                        firstName: signatory_firstName[i],
                        middleName: signatory_middleName[i],
                        lastName: signatory_lastName[i]
                    });
                }
                    
                const otherPeople = [];
                for (let i = 0; i < other_firstName.length; i++) {
                    otherPeople.push({
                        firstName: other_firstName[i],
                        middleName: other_middleName[i],
                        lastName: other_lastName[i],
                        contactNo: [other_contactNo[i]]
                    });
                }

                const updateData = {
                    name,
                    area,
                    depositoryBank,
                    bankAccountType,
                    bankAccountNum,
                    signatories,
                    otherPeople
                };
    
                // either should work... i think. as long as the group id is passed in the url
                //const updatedGroup = await Group.findOneAndUpdate({ _id: groupId }, updateData, { new: true });
                const updatedGroup = await Group.findOneAndUpdate({SPU: group.SPU, name: group.name, area: group.area}, updateData,{ new: true });

                if (updatedGroup) {
                    return res.json(updatedGroup);
                  } else {
                    return res.status(404).json( { error: "Update error!"});
                }

                //res.redirect("/dashboard");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while editing the group." });
        }
    },

    // delete a group
    deleteGroup: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const groupId = req.params.id;
                const group = await Group.findById(groupId);
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);

                //delete savings
                for (const member of group.member) {
                    await Saving.deleteMany({ member: member });
                }
                //delete members
                await Member.deleteMany({ _id: { $in: group.member } });
                //delete groups                
                const deletedGroup = await Group.findByIdAndDelete(groupId);
    
                // If the project was successfully deleted, delete associated groups, members, and savings
                if (deletedGroup) {
                    return res.json(deletedGroup);
                } else {
                    return res.status(404).json({ error: "Delete error! Project not found." });
                }
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while deleting the project." });
        }
    },

    //create a new project
    newProject: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
    
                // idk what the form will have
                const { name } = req.body;
            
 
    
                let groups = [];
                const newProject = new Project({
                    name,
                    groups,
                    //anything else to add?
                });
                await newProject.save();

                const cluster = await Cluster.findById(req.session.clusterId);
                cluster.projects.push(newProject._id);
                cluster.totalProjects+=1;
                await cluster.save();
    
                //redirecting to dashboard rn cuz idk where else to redirect to
                res.redirect("/project");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while creating a new project." });
        }
    },
    
    
    //retrieve project
    retrieveProject: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const sidebar = req.session.sidebar;
                const page = req.params.page;
                const userID = req.session.userId;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;
                // const project = await Project.findById(projectId)
                //     // .populate('groups')
                //     //.populate('members').populate('savings');
                // const loggedInUserId = req.session.userId;
                // const user = await User.findById(loggedInUserId);


                // if (!project) {
                //     return res.status(404).render("fail", { error: "Project not found." });
                // }
                const project = await Project.findOne({ _id: req.session.projectId });
                const updatedParts = await Group.find({_id: { $in: project.groups } }); //to be change
                await updateOrgParts(updatedParts); 
                // const orgParts = getOrgParts();
                const orgParts = updatedParts;
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
                res.render("group", { authority, pageParts, username, sidebar, dashbuttons, page, totalPages  });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while retrieving group information." });
        }
    },


    // edit project
    editProject: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const projectId = req.params.id;
                const project = await Project.findById(projectId);

                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);

                const { name, location } = req.body;
                
                const existingProject = await Project.findOne({ name });
                if (existingProject) {
                    return res.status(400).json({ error: "A project with the same name already exists." });
                }

                updateData = req.body;
                /*
                //IF MOVING THE PROJECT FROM ONE CLUSTER TO ANOTHER

                //Assuming u can move the project from... anywhere ig (ie destination cluster)
                //const oldCluster = await Cluster.findOne({ projects: project._id });
                //const newCluster = await Cluster.findById(req.session.clusterId); //cuz the currently open cluster Id would be stored in middleware na

                //Assuming that the project is moved from one (the currently open) cluster to another (not open), the following code should work.
                //To add: only admin can do this?
                const oldClusterId = req.session.clusterId;
                const oldCluster = await Cluster.findById(oldClusterId);
                oldCluster.projects = oldCluster.projects.filter(id => id.toString() !== projectId);
                await oldCluster.save();


                clusterId = req.params.clusterId; 
                const newCluster = await Cluster.findById(clusterId);
                newCluster.projects.push(project._id);
                */ 
    
                // either should work... i think. as long as the group id is passed in the url
                //const updateProject = await Project.findOneAndUpdate({ _id: projectId }, updateData, { new: true });
                const updateProject = await Project.findOneAndUpdate({name: project.name}, updateData,{ new: true });

                if (updateProject) {
                    return res.json(updateProject);
                  } else {
                    return res.status(404).json( { error: "Update error!"});
                }

                //res.redirect("/dashboard");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while editing the project." });
        }
    },

    deleteProject: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const projectId = req.params.id;
    
                // Find the project by ID
                const project = await Project.findById(projectId);
    
                // Check if the logged-in user is authorized to delete the project
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);


                //THIS IS PROBABLY SLOW IDK HOW TO OPTIMIZE IT  
                //delete savings
                    for (const group of project.groups) {
                        for (const member of group.members) {
                            await Saving.deleteMany({ member: member });
                        }
                    }
                //delete members
                    for (const group of project.groups) {
                        await Member.deleteMany({ _id: { $in: group.members } });
                    }
                //delete groups
                    await Group.deleteMany({ _id: { $in: project.groups } });
                
                // 4. Delete projects in cluster

                
                const deletedProject = await Project.findByIdAndDelete(projectId);
    
                // If the project was successfully deleted, delete associated groups, members, and savings
                if (deletedProject) {
                    return res.json(deletedProject);
                } else {
                    return res.status(404).json({ error: "Delete error! Project not found." });
                }
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while deleting the project." });
        }
    },


    //create a new cluster
    newCluster: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                // idk what this form will have
                const { name, location } = req.body;
                const existingCluster = await Cluster.findOne({ name });
                if (existingCluster) {
                    return res.status(400).json({ error: "A Cluster with the same name already exists." });
                }
                let projects = [];
                const newCluster = new Cluster({
                    name,
                    location,
                    projects,
                });
                await newCluster.save();

                //redirecting to dashboard rn cuz idk where else to redirect to
                res.redirect("/cluster");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while creating a new cluster." });
        }
    },


    //retrieve cluster
    retrieveCluster: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const sidebar = req.session.sidebar;
                const page = req.params.page;
                const userID = req.session.userId;
                const user = await User.findById(userID);
                const authority = user.authority;
                const username = user.username;
                // const clusterId = req.params.id; 
                // const cluster = await Cluster.findById({}); // to be fixed
                // const loggedInUserId = req.session.userId;
                // if (!cluster.validSEDOs.includes(loggedInUserId) && !(user.authority != "admin")) {
                //     return res.status(403).json({ error: "You are not authorized to edit this cluster." });
                // }
                // if (!cluster) {
                //     return res.status(404).render("fail", { error: "Cluster not found." });
                // }
                const cluster = await Cluster.findOne({ _id: req.session.clusterId });
                const updatedParts = await Project.find({ _id: { $in: cluster.projects } });
                await updateOrgParts(updatedParts); 
                // const orgParts = getOrgParts();
                const orgParts = updatedParts;
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
                res.render("project", { authority, pageParts, username, sidebar, dashbuttons, page, totalPages  });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while retrieving group information." });
        }
    },


    // edit cluster
    editCluster: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const clusterId = req.params.id;
                const cluster = await Cluster.findById(clusterId);

                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);


                const { name, location, oldName } = req.body;
                if (oldName !== name){
                    const existingCluster = await Cluster.findOne({ name });
                    if (existingCluster) {
                        return res.status(400).json({ error: "A Cluster with the same name already exists." });
                    }
                }
                updateData = req.body;
    
                // either should work... i think. as long as the group id is passed in the url
                //const updateCluster = await Cluster.findOneAndUpdate({ _id: projectId }, updateData, { new: true });
                const updateCluster = await Cluster.findOneAndUpdate({name: cluster.name}, updateData,{ new: true });

                if (updateCluster) {
                    res.redirect("/cluster");
                  } else {
                    return res.status(500).render("fail", { error: "Update error!" });
                }

                // res.redirect("/cluster");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while editing the group." });
        }
    },

    deleteCluster: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const clusterId = req.params.id;
                const cluster = await Cluster.findById(clusterId);
    
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);
                
                //THIS IS PROBABLY SLOW IDK HOW TO OPTIMIZE IT
                // 1. Delete savings for members in groups
                for (const project of cluster.projects) {
                    if (Array.isArray(project.groups)) {
                        for (const group of project.groups) {
                            if (Array.isArray(group.members)) {
                                for (const member of group.members) {
                                    await Saving.deleteMany({ member: member });
                                }
                            }
                        }
                    }
                }                
                // 2. Delete members in groups
                for (const project of cluster.projects) {
                    if (Array.isArray(project.groups)) {
                        for (const group of project.groups) {
                            if (Array.isArray(group.members)) {
                                await Member.deleteMany({ _id: { $in: group.members } });
                            }
                        }
                    }
                }
                // 3. Delete groups in projects
                for (const project of cluster.projects) {
                    await Group.deleteMany({ _id: { $in: project.groups } });
                }
                // 4. Delete projects in cluster
                await Project.deleteMany({ _id: { $in: cluster.projects } });
                
                const deletedCluster = await Cluster.findByIdAndDelete(clusterId);
    
                if (deletedCluster) {
                    return res.json(deletedCluster);
                } else {
                    return res.status(404).json({ error: "Delete error!" });
                }
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while deleting the cluster." });
        }
    },
    newMember: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                // idk what this form will have
                const { name, id, photo, nameFather, nameMother, age, sex, birthdate, address } = req.body;
                
                let savings = [];
                const newMember = new Member({
                    name,
                    id,
                    photo,
                    nameFather,
                    nameMother,
                    age,
                    sex,
                    birthdate,
                    address,
                    savings
                });
                await newMember.save();

                //redirecting to dashboard rn cuz idk where else to redirect to
                res.redirect("/dashboard");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while creating a new group." });
        }
    },

    editMember: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const memberId = req.params.id;
                const member = await Member.findById(memberId);
                const group = await Group.find({ members: member._id });
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);


                updateData = req.body;
                
                const updateMember = await Member.findOneAndUpdate({id: memberId}, updateData,{ new: true });

                if (updateMember) {
                    return res.json(updateMember);
                  } else {
                    return res.status(404).json( { error: "Update error!"});
                }

                //res.redirect("/dashboard");
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while editing the group." });
        }
    },

    deleteMember: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                const memberId = req.params.id;
                const member = await Group.findById(memberId);
                const group = await Group.find({ members: member._id });
                const loggedInUserId = req.session.userId;
                const user = await User.findById(loggedInUserId);

                await Saving.deleteMany({ member: member });
                await Member.deleteMany({ _id: { $in: group.members } });
                const deletedMember = await Member.findByIdAndDelete(memberId);
                if (deletedMember) {
                    return res.json(deletedMember);
                } else {
                    return res.status(404).json({ error: "Delete error! Project not found." });
                }
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while deleting the project." });
        }
    },

    SHGChoices: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                let { project } = req.body;
                console.log(project)
                const SHG = await Group.find({});
                res.json({ SHG });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while retrieving group information." });
        }
    },

    projectChoices: async (req, res) => {
        try {
            if (req.session.isLoggedIn) {
                let { cluster } = req.body;
                const project = await Project.find({});
                res.json({ project });
            } else {
                res.redirect("/");
            }
        } catch (error) {
            console.error(error);
            return res.status(500).render("fail", { error: "An error occurred while retrieving group information." });
        }
    }
    

}

module.exports = partController;
