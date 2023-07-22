const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
	assigned_to: {
		type: String,
		default: ""
	},
	status_text: {
		type: String,
		default: ""
	},
	open: {
		type: Boolean,
		default: true
	},
	issue_title: {
		type: String,
		required: true,
	},
	issue_text: {
		type: String,
		required: true,
	},
	created_by: {
		type: String,
		required: true,
	},
	created_on: {
		type: Date,
		default: Date.now()
	},
	updated_on: {
		type: Date,
		default: Date.now()
	}
}, { versionKey: false })

const IssueModel = mongoose.model('Issue', issueSchema)

module.exports = {
	issueSchema,
	IssueModel
}