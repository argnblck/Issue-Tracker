const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let idToDelete;

suite('Functional Tests', () => {
	suite('Post request test', () => {
		test('Create an issue with every field', (done) => {
			chai
				.request(server)
				.keepOpen()
				.post('/api/issues/apitest')
				.type('form')
				.send({
					issue_title: 'test title',
					issue_text: 'test text',
					created_by: 'test sender',
					assigned_to: 'test receiver',
					status_text: 'test status text'
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.issue_title, 'test title');
					assert.equal(res.body.issue_text, 'test text');
					assert.equal(res.body.created_by, 'test sender');
					assert.equal(res.body.assigned_to, 'test receiver');
					assert.equal(res.body.status_text, 'test status text');
					idToDelete = res.body._id;
					done()
				})
		});
		test('Create an issue with only required fields', (done) => {
			chai
				.request(server)
				.keepOpen()
				.post('/api/issues/apitest')
				.type('form')
				.send({
					issue_title: 'test title',
					issue_text: 'test text',
					created_by: 'test sender',
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.issue_title, 'test title');
					assert.equal(res.body.issue_text, 'test text');
					assert.equal(res.body.created_by, 'test sender');
					assert.equal(res.body.assigned_to, '');
					assert.equal(res.body.status_text, '');
					done()
				})
		});
		test('Create an issue with missing required fields', (done) => {
			chai
				.request(server)
				.keepOpen()
				.post('/api/issues/apitest')
				.type('form')
				.send({
					assigned_to: 'test receiver',
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'required field(s) missing');
					done()
				})
		});
	});

	suite('Get request test', () => {
		test('View issues on a project', (done) => {
			chai
				.request(server)
				.keepOpen()
				.get('/api/issues/api')
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.length, 3);
					done();
				})
		});
		test('View issues on a project with one filter', (done) => {
			chai
				.request(server)
				.keepOpen()
				.get('/api/issues/api')
				.query({ issue_title: 'test issue' })
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body[0], {
						assigned_to: 'chaitest',
						status_text: 'tested',
						open: true,
						issue_title: 'test issue',
						issue_text: 'this is test issue',
						created_by: 'Test',
						created_on: '2023-07-22T13:58:41.773Z',
						updated_on: '2023-07-22T13:58:41.773Z',
						_id: '64bbe174410f9c0cb23ad8b6'
					});
					done();
				})
		});
		test('View issues on a project with multiple filters', (done) => {
			chai
				.request(server)
				.keepOpen()
				.get('/api/issues/api')
				.query({ open: true, assigned_to: "chaitest" })
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.deepEqual(res.body[0], {
						assigned_to: 'chaitest',
						status_text: 'tested',
						open: true,
						issue_title: 'test issue',
						issue_text: 'this is test issue',
						created_by: 'Test',
						created_on: '2023-07-22T13:58:41.773Z',
						updated_on: '2023-07-22T13:58:41.773Z',
						_id: '64bbe174410f9c0cb23ad8b6'
					});
					done();
				})
		});
	});
	suite('Put request test', () => {
		test('Update one field on an issue', (done) => {
			chai
				.request(server)
				.keepOpen()
				.put('/api/issues/api')
				.send({
					_id: '64bbd889271cf5f891205468',
					issue_title: 'Test change'
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body._id, '64bbd889271cf5f891205468');
					assert.equal(res.body.result, 'successfully updated');
					done();
				})
		});
		test('Update multiple fields on an issue', (done) => {
			chai
				.request(server)
				.keepOpen()
				.put('/api/issues/api')
				.send({
					_id: '64bbdfe1271cf5f89120546e',
					issue_title: 'Second Test change',
					open: false,
					issue_text: 'this is changed test issue',
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body._id, '64bbdfe1271cf5f89120546e');
					assert.equal(res.body.result, 'successfully updated');
					done();
				})
		});
		test('Update an issue with missing _id', (done) => {
			chai
				.request(server)
				.keepOpen()
				.put('/api/issues/api')
				.send({
					issue_title: 'Test change'
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'missing _id');
					done();
				})
		});
		test('Update an issue with no fields to update', (done) => {
			chai
				.request(server)
				.keepOpen()
				.put('/api/issues/api')
				.send({
					_id: '64bbe174410f9c0cb23ad8b6'
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'no update field(s) sent');
					done();
				})
		});
		test('Update an issue with an invalid _id', (done) => {
			chai
				.request(server)
				.keepOpen()
				.put('/api/issues/api')
				.send({
					_id: '64bbe174410f8d4cb23ad8b6',
					issue_title: 'Test change'
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'could not update');
					done();
				})
		});
	});
	suite('Delete request test', () => {
		test('Delete an issue', (done) => {
			chai
				.request(server)
				.keepOpen()
				.delete('/api/issues/apitest')
				.send({
					_id: idToDelete,
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.result, 'successfully deleted');
					assert.equal(res.body._id, idToDelete);
					done();
				})
		});
		test('Delete an issue with an invalid _id', (done) => {
			chai
				.request(server)
				.keepOpen()
				.delete('/api/issues/apitest')
				.send({
					_id: idToDelete,
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'could not delete');
					assert.equal(res.body._id, idToDelete);
					done();
				})
		});
		test('Delete an issue with missing _id', (done) => {
			chai
				.request(server)
				.keepOpen()
				.delete('/api/issues/apitest')
				.send({
				})
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, 'application/json');
					assert.equal(res.body.error, 'missing _id');
					done();
				})
		});
	})
});
