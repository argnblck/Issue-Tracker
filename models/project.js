const mongoose = require('mongoose');
const { issueSchema } = require('./issue');

const projectSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	issues: [issueSchema]
})

const ProjectModel = mongoose.model('Project', projectSchema);

module.exports = ProjectModel;