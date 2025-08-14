/* eslint-disable */
const http = require('http');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const Sentry = require('@sentry/node');
const { Server } = require('socket.io');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

Sentry.init({ dsn: process.env.SENTRY_DSN || '', tracesSampleRate: 1.0 });
app.use(Sentry.Handlers.requestHandler());

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*', credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 });
app.use(limiter);

const apiRouter = express.Router();
app.use('/api', apiRouter);

// Health
apiRouter.get('/health', (req, res) => res.json({ ok: true }));

// Routes
apiRouter.use('/auth', require('./api/auth'));
apiRouter.use('/realms', require('./api/realms'));
apiRouter.use('/collapse-state', require('./api/collapse-state'));
apiRouter.use('/superposition', require('./api/superposition'));
apiRouter.use('/collaboration', require('./api/collaboration'));
apiRouter.use('/mitigation', require('./api/mitigation'));
apiRouter.use('/search', require('./api/search'));
apiRouter.use('/history', require('./api/history'));

app.use(Sentry.Handlers.errorHandler());

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });

// Socket.IO Setup
io.on('connection', (socket) => {
	const { realmId, userId } = socket.handshake.query;
	socket.join(`realm:${realmId}`);
	socket.on('circuit:update', (payload) => {
		io.to(`realm:${realmId}`).emit('circuit:update', { userId, ...payload });
	});
	socket.on('cursor:move', (payload) => {
		io.to(`realm:${realmId}`).emit('cursor:move', { userId, ...payload });
	});
	socket.on('disconnect', () => {});
});

async function connectMongo() {
	const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quantumforge';
	mongoose.set('strictQuery', true);
	await mongoose.connect(mongoUri, { dbName: 'quantumforge' });
	// Indexes can be ensured here
}

const PORT = process.env.PORT || 4000;

connectMongo()
	.then(() => {
		server.listen(PORT, () => {
			console.log(`QuantumForge server listening on :${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to MongoDB', err);
		process.exit(1);
	});

module.exports = { app, server };