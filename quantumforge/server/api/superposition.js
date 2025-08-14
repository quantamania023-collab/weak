const express = require('express');
const jwt = require('jsonwebtoken');
const Realm = require('../models/Realm');

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

router.post('/create', requireAuth, async (req, res) => {
	const { realmId, branchName } = req.body || {};
	if (!realmId || !branchName) return res.status(400).json({ error: 'Missing inputs' });
	const realm = await Realm.findById(realmId);
	if (!realm) return res.status(404).json({ error: 'Realm not found' });
	// Using git branching would happen here; we store branch name in response for now
	return res.status(201).json({ branch: { name: branchName, realmId } });
});

router.post('/compare', requireAuth, async (req, res) => {
	const { branches } = req.body || {};
	if (!Array.isArray(branches) || branches.length < 1) return res.status(400).json({ error: 'No branches provided' });
	// Mock metrics
	const metrics = branches.map((b) => ({ branch: b, fidelity: Math.random() * 0.2 + 0.8, depth: Math.floor(Math.random() * 50) + 5 }));
	return res.json({ metrics });
});

module.exports = router;