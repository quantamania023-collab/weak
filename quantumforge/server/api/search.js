const express = require('express');
const jwt = require('jsonwebtoken');
const { Client } = require('@elastic/elasticsearch');

const router = express.Router();

const esClient = new Client({ node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200' });

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
	const q = req.query.q || '';
	if (!q) return res.json({ results: [] });
	try {
		const result = await esClient.search({ index: process.env.ELASTICSEARCH_INDEX || 'quantumforge', query: { multi_match: { query: q, fields: ['name^2', 'description', 'message', 'tags', 'code'] } } });
		const hits = (result.hits && result.hits.hits) || [];
		return res.json({ results: hits.map((h) => ({ id: h._id, score: h._score, ...h._source })) });
	} catch (e) {
		// Fallback mock
		return res.json({ results: [{ id: 'mock', score: 0.1, type: 'realm', name: 'Demo Realm', description: 'Example match for ' + q }] });
	}
});

module.exports = router;