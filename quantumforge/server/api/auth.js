const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

function makeToken(user) {
	return jwt.sign({ sub: user._id, email: user.email }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
}

async function sendVerificationEmail(email, token) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST || 'localhost',
		port: parseInt(process.env.SMTP_PORT || '25', 10),
		secure: false,
		ignoreTLS: true
	});
	const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify?token=${token}`;
	try {
		await transporter.sendMail({ from: 'no-reply@quantumforge.io', to: email, subject: 'Verify your Qubit Registration', text: `Verify: ${verifyUrl}` });
	} catch (e) {
		console.log('Verification email (mock):', verifyUrl);
	}
}

router.post('/register', async (req, res) => {
	try {
		const { username, email, password, tags } = req.body || {};
		if (!username || !email || !password) return res.status(400).json({ error: 'Decoherence detected: Missing fields' });
		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already registered' });
		const hashed = await bcrypt.hash(password, 10);
		const user = await User.create({ username, email, password: hashed, tags: Array.isArray(tags) ? tags : [], realms: [], verified: false });
		const token = makeToken(user);
		await sendVerificationEmail(email, token);
		return res.status(201).json({ token, user: { id: user._id, username, email, tags: user.tags, verified: user.verified } });
	} catch (e) {
		return res.status(500).json({ error: 'Quantum fluctuation: Registration failed' });
	}
});

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ error: 'Missing credentials' });
		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });
		const ok = await bcrypt.compare(password, user.password);
		if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
		const token = makeToken(user);
		return res.json({ token, user: { id: user._id, username: user.username, email: user.email, tags: user.tags, verified: user.verified } });
	} catch (e) {
		return res.status(500).json({ error: 'Quantum fluctuation: Login failed' });
	}
});

function authMiddleware(req, _res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return next();
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.userId = payload.sub;
	} catch (e) {}
	return next();
}

router.get('/profile', authMiddleware, async (req, res) => {
	if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
	const user = await User.findById(req.userId).lean();
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.json({ user: { id: user._id, username: user.username, email: user.email, tags: user.tags, realms: user.realms, verified: user.verified } });
});

router.put('/profile', authMiddleware, async (req, res) => {
	if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
	const { username, tags } = req.body || {};
	const user = await User.findByIdAndUpdate(req.userId, { $set: { username, tags: Array.isArray(tags) ? tags : [] } }, { new: true }).lean();
	return res.json({ user: { id: user._id, username: user.username, email: user.email, tags: user.tags, realms: user.realms, verified: user.verified } });
});

module.exports = router;