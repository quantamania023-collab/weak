const express = require('express');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const Realm = require('../models/Realm');
const State = require('../models/State');
const { simulateCircuit } = require('../services/quantum-sim');

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

router.post('/', requireAuth, async (req, res) => {
	try {
		const { realmId, filepath, message } = req.body || {};
		if (!realmId || !filepath || !message) return res.status(400).json({ error: 'Missing inputs' });
		const realm = await Realm.findById(realmId);
		if (!realm) return res.status(404).json({ error: 'Realm not found' });
		const fileAbs = path.isAbsolute(filepath) ? filepath : path.join(realm.gitDir, filepath);
		if (!fs.existsSync(fileAbs)) return res.status(400).json({ error: 'File not found in realm' });
		const code = fs.readFileSync(fileAbs, 'utf8');

		const qubitsEstimate = (code.match(/qreg\s+\w+\[(\d+)\]/) || [])[1] ? parseInt((code.match(/qreg\s+\w+\[(\d+)\]/) || [])[1], 10) : 0;
		const shots = qubitsEstimate > 10 ? 1000 : 4096;
		const result = await simulateCircuit({ code, shots });

		const commitId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
		const state = await State.create({ realmId, commitId, branch: realm.defaultBranch, code, message, shots: result.shots, qubits: result.qubits, stateData: result.distribution });
		return res.status(201).json({ state });
	} catch (e) {
		return res.status(500).json({ error: 'Wavefunction collapse failed' });
	}
});

module.exports = router;