const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app, server, mongo;
let token;
let realmId;
let realmFilePath;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongo.getUri();
	({ app, server } = require('../server'));
	const reg = await request(app).post('/api/auth/register').send({ username: 'alice', email: 'a3@example.com', password: 'Secret123!' });
	token = reg.body.token;
	// create realm
	const tmp = path.join(__dirname, 'tmp2');
	if (!fs.existsSync(tmp)) fs.mkdirSync(tmp);
	realmFilePath = path.join(tmp, 'bell.qasm');
	fs.writeFileSync(realmFilePath, 'OPENQASM 2.0; qreg q[2]; h q[0]; cx q[0],q[1];');
	const realmRes = await request(app)
		.post('/api/realms/create')
		.set('Authorization', `Bearer ${token}`)
		.attach('files', realmFilePath)
		.field('name', 'Bell Realm 2');
	realmId = realmRes.body.realm._id;
});

afterAll(async () => {
	await mongoose.disconnect();
	if (server && server.close) server.close();
	if (mongo) await mongo.stop();
});

test('collapse state creates state doc', async () => {
	const res = await request(app)
		.post('/api/collapse-state')
		.set('Authorization', `Bearer ${token}`)
		.send({ realmId, filepath: 'bell.qasm', message: 'Added H gate' });
	expect(res.status).toBe(201);
	expect(res.body.state).toBeDefined();
	expect(res.body.state.stateData).toBeDefined();
});