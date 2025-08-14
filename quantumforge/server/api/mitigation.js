const express = require('express');
const jwt = require('jsonwebtoken');

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

router.post('/analyze', requireAuth, async (req, res) => {
	const { commitId } = req.body || {};
	if (!commitId) return res.status(400).json({ error: 'Missing commitId' });
	const techniques = ['zne', 'readout_calibration', 'dynamical_decoupling'];
	const results = techniques.map((tech) => ({ technique: tech, errorRate: parseFloat((Math.random() * 0.05 + 0.02).toFixed(4)) }));
	const worst = results.reduce((a, b) => (a.errorRate > b.errorRate ? a : b));
	let suggestion = 'Use standard error mitigation.';
	if (worst.errorRate > 0.06) suggestion = 'Recommend dynamical decoupling due to high noise.';
	else if (worst.errorRate > 0.045) suggestion = 'Apply zero-noise extrapolation (ZNE) for improved fidelity.';
	return res.json({ results, suggestion });
});

module.exports = router;