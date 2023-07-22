'use strict';

const mongoose = require('mongoose')
const { IssueModel } = require('../models/issue.js');
const ProjectModel = require('../models/project.js');
const { ObjectId } = mongoose.Types

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let project = req.params.project;

      const { _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
        created_on,
        updated_on
      } = req.query;

      ProjectModel.aggregate([
        { $match: { name: project } },
        { $unwind: "$issues" },
        _id !== undefined
          ? { $match: { "issues._id": new ObjectId(_id) } }
          : { $match: {} },
        issue_title !== undefined
          ? { $match: { "issues.issue_title": issue_title } }
          : { $match: {} },
        issue_text !== undefined
          ? { $match: { "issues.issue_text": issue_text } }
          : { $match: {} },
        created_by !== undefined
          ? { $match: { "issues.created_by": created_by } }
          : { $match: {} },
        assigned_to !== undefined
          ? { $match: { "issues.assigned_to": assigned_to } }
          : { $match: {} },
        status_text !== undefined
          ? { $match: { "issues.status_text": status_text } }
          : { $match: {} },
        open !== undefined
          ? { $match: { "issues.open": Boolean(open) } }
          : { $match: {} },
        created_on !== undefined
          ? { $match: { "issues.created_on": created_on } }
          : { $match: {} },
        updated_on !== undefined
          ? { $match: { "issues.updated_on": updated_on } }
          : { $match: {} },
      ])
        .exec()
        .then(data => {
          if (!data) {
            res.json([]);
          } else {
            const issues = data.map(item => item.issues);
            res.json(issues);
          }
        })
        .catch(err => {
          res.send(err.message)
        })
    })

    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      } = req.body

      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: 'required field(s) missing' });
        return
      }

      const newIssue = new IssueModel({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      })

      ProjectModel.findOne({ name: project })
        .then(projectData => {
          if (!projectData) {
            const newProject = new ProjectModel({ name: project });
            newProject.issues.push(newIssue);
            newProject.save()
              .then(() => {
                res.json(newIssue)
              })
              .catch(err => res.send(err.message));
          } else {
            projectData.issues.push(newIssue);
            projectData.save()
              .then(() => {
                res.json(newIssue)
              })
              .catch(err => res.send(err.message));
          }
        })
    })

    .put(function (req, res) {
      let project = req.params.project;
      const { _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return;
      }
      if (!issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open) {
        res.json({
          error: 'no update field(s) sent',
          '_id': _id
        });
        return;
      }

      ProjectModel.findOne({ name: project })
        .then(projectData => {
          if (!projectData) {
            throw new Error('could not update')
          } else {
            const issueData = projectData.issues.id(_id);
            if (!issueData) {
              throw new Error('could not update')
            } else {
              issueData.issue_title = issue_title || issueData.issue_title;
              issueData.issue_text = issue_text || issueData.issue_text;
              issueData.created_by = created_by || issueData.created_by;
              issueData.assigned_to = assigned_to || issueData.assigned_to;
              issueData.status_text = status_text || issueData.status_text;
              issueData.open = open;
              issueData.updated_on = Date.now();
              return projectData.save()
            }
          }
        })
        .then(data => {
          if (!data) {
            throw new Error('could not update')
          } else {
            res.json({ result: 'successfully updated', '_id': _id })
          }
        })
        .catch(err => {
          res.json({ error: err.message, '_id': _id });
        })
    })

    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;

      if (!_id) {
        res.json({ error: 'missing _id' });
        return
      }

      ProjectModel.findOne({ name: project })
        .then(projectData => {
          if (!projectData) {
            throw new Error('could not delete');
          }

          const issueToDelete = projectData.issues.id(_id);
          if (!issueToDelete) {
            throw new Error('could not delete');
          }
          issueToDelete.deleteOne()
          return projectData.save();
        })
        .then(data => {
          if (!data) {
            throw new Error('could not delete')
          } else {
            res.json({ result: 'successfully deleted', '_id': _id })
          }
        })
        .catch(err => {
          res.json({ error: err.message, '_id': _id })
        })
    });

};
