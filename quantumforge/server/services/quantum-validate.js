const fs = require('fs');
const path = require('path');

function isQasm(content) {
	return /OPENQASM\s+2\.0|OPENQASM\s+3\.0/i.test(content) || /qreg\s+\w+\[\d+\]/.test(content);
}

function isCirqPy(content) {
	return /import\s+cirq/.test(content);
}

function isQiskitPy(content) {
	return /from\s+qiskit\s+import|import\s+qiskit/.test(content);
}

async function validateQuantumFiles(dir) {
	const files = fs.readdirSync(dir).filter((f) => !f.startsWith('.'));
	if (files.length === 0) return { ok: false, error: 'No files uploaded' };
	let valid = false;
	for (const file of files) {
		const full = path.join(dir, file);
		const stat = fs.statSync(full);
		if (stat.isDirectory()) continue;
		const content = fs.readFileSync(full, 'utf8');
		const ext = path.extname(file).toLowerCase();
		if (ext === '.qasm' && isQasm(content)) valid = true;
		if (ext === '.py' && (isCirqPy(content) || isQiskitPy(content))) valid = true;
	}
	return { ok: valid, error: valid ? undefined : 'No valid QASM or Python (Qiskit/Cirq) files found' };
}

module.exports = { validateQuantumFiles };