const { spawn } = require('child_process');

function mockDistribution(shots, numQubits = 2) {
	const outcomes = {};
	const maxState = Math.min(1 << numQubits, 1 << 10);
	for (let i = 0; i < shots; i++) {
		const sample = Math.floor(Math.random() * maxState);
		const key = sample.toString(2).padStart(numQubits, '0');
		outcomes[key] = (outcomes[key] || 0) + 1;
	}
	return outcomes;
}

async function simulateCircuit({ code, shots }) {
	// In production, this can spawn a Python process to run Qiskit or Cirq
	// For now, we mock based on rough qubit estimation
	const qubits = (() => {
		const match = code.match(/qreg\s+\w+\[(\d+)\]/);
		if (match) return parseInt(match[1], 10);
		const circle = code.match(/cirq\.LineQubit\.range\((\d+)\)/);
		if (circle) return parseInt(circle[1], 10);
		return 2;
	})();
	return { qubits, shots, distribution: mockDistribution(shots, qubits) };
}

module.exports = { simulateCircuit };