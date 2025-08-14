const express = require('express');
const jwt = require('jsonwebtoken');
const State = require('../models/State');

const router = express.Router();

function requireAuth(req, res, next) {
	const header = req.headers.authorization || '';
	const token = header.startsWith('Bearer ') ? header.slice(7) : null;
	if (!token) return res.status(401).json({ error: 'Not authenticated' });
	try {
		const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_secret');
		req.userId = payload.sub;
		return next();
	} catch (e) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

router.get('/', requireAuth, async (req, res) => {
	const { realmId } = req.query || {};
	if (!realmId) return res.status(400).json({ error: 'Missing realmId' });
	const states = await State.find({ realmId }).sort({ createdAt: -1 }).lean();
	return res.json({ states });
});

module.exports = router;