const request = require('supertest');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app, server, mongo;
let token;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongo.getUri();
	({ app, server } = require('../server'));
	const res = await request(app).post('/api/auth/register').send({ username: 'alice', email: 'a2@example.com', password: 'Secret123!' });
	token = res.body.token;
});

afterAll(async () => {
	await mongoose.disconnect();
	if (server && server.close) server.close();
	if (mongo) await mongo.stop();
});

test('create realm with qasm file', async () => {
	const uploadDir = path.join(__dirname, 'tmp');
	if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
	const qasm = 'OPENQASM 2.0; qreg q[2]; h q[0]; cx q[0],q[1];';
	const filePath = path.join(uploadDir, 'bell.qasm');
	fs.writeFileSync(filePath, qasm);
	const res = await request(app)
		.post('/api/realms/create')
		.set('Authorization', `Bearer ${token}`)
		.attach('files', filePath)
		.field('name', 'Bell Realm')
		.field('description', 'Bell pair');
	expect(res.status).toBe(201);
	expect(res.body.realm).toBeDefined();
});