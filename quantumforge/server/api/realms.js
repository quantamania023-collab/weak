const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const Realm = require('../models/Realm');
const User = require('../models/User');
const { validateQuantumFiles } = require('../services/quantum-validate');
const git = require('isomorphic-git');
const httpFs = require('isomorphic-git/http/node');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });
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

router.post('/create', requireAuth, upload.array('files'), async (req, res) => {
	try {
		const { name, description } = req.body || {};
		if (!name) return res.status(400).json({ error: 'Missing name' });
		const owner = req.userId;
		const files = req.files || [];
		const repoRoot = path.join(__dirname, '..', 'repos');
		if (!fs.existsSync(repoRoot)) fs.mkdirSync(repoRoot, { recursive: true });
		const repoDir = path.join(repoRoot, `${Date.now()}_${Math.random().toString(36).slice(2)}`);
		fs.mkdirSync(repoDir, { recursive: true });

		for (const f of files) {
			const targetPath = path.join(repoDir, f.originalname);
			fs.copyFileSync(f.path, targetPath);
		}

		const validation = await validateQuantumFiles(repoDir);
		if (!validation.ok) return res.status(400).json({ error: validation.error || 'Decoherence detected: Invalid circuit files' });

		await git.init({ fs, dir: repoDir });
		await git.add({ fs, dir: repoDir, filepath: '.' });
		await git.commit({ fs, dir: repoDir, message: 'Initial superposition', author: { name: 'QuantumForge', email: 'noreply@quantumforge.io' } });

		const realm = await Realm.create({ name, description: description || '', owner, files: files.map(f => ({ name: f.originalname, path: `/${path.basename(repoDir)}/${f.originalname}`, language: path.extname(f.originalname).slice(1), size: f.size })), gitDir: repoDir });
		await User.findByIdAndUpdate(owner, { $push: { realms: realm._id } });

		return res.status(201).json({ realm });
	} catch (e) {
		return res.status(500).json({ error: 'Quantum anomaly: Failed to spawn realm' });
	}
});

router.get('/:id', requireAuth, async (req, res) => {
	const realm = await Realm.findById(req.params.id).lean();
	if (!realm) return res.status(404).json({ error: 'Realm not found' });
	return res.json({ realm });
});

module.exports = router;