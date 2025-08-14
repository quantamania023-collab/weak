const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let app, server, mongo;

beforeAll(async () => {
	mongo = await MongoMemoryServer.create();
	process.env.MONGODB_URI = mongo.getUri();
	({ app, server } = require('../server'));
});

afterAll(async () => {
	await mongoose.disconnect();
	if (server && server.close) server.close();
	if (mongo) await mongo.stop();
});

test('register and login flow', async () => {
	const res = await request(app).post('/api/auth/register').send({ username: 'alice', email: 'a@example.com', password: 'Secret123!', tags: ['QEC'] });
	expect(res.status).toBe(201);
	expect(res.body.token).toBeDefined();
	const login = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'Secret123!' });
	expect(login.status).toBe(200);
	expect(login.body.token).toBeDefined();
});

test('duplicate email rejected', async () => {
	await request(app).post('/api/auth/register').send({ username: 'bob', email: 'dup@example.com', password: 'Secret123!' });
	const res = await request(app).post('/api/auth/register').send({ username: 'bob2', email: 'dup@example.com', password: 'Secret123!' });
	expect(res.status).toBe(409);
});