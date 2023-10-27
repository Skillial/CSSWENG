const Cluster = require('../models/Cluster');
const Project = require('../models/Project');
const User = require('../models/User');
const SHG = require('../models/Group');

const mongoose = require('mongoose')


const formsController = {

    loadEditClusterForm: async (req, res) => {
        const clusterName = req.params.clusterName;
        const cluster = await Cluster.findOne({name: clusterName});
        res.render('components/popupFields/ClusterFormFields', {cluster});
    },
    loadEditSubProjectsForm: async (req, res) => {
        const projectName = req.params.projectName;
        const project = await Project.findOne({name: projectName});
        res.render('components/popupFields/Sub-ProjectsFormFields', {project});
    },
    loadEditSHGForm: async (req, res) => {
        const shgName = req.params.shgName;
        const shg = await SHG.findOne({name: shgName});
        res.render('components/popupFields/SHGFormFields', {shg});
    },
}

module.exports = formsController;