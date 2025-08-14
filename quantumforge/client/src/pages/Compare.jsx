import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Compare() {
	const { id } = useParams()
	const [branches, setBranches] = useState('main,exp-h')
	const [metrics, setMetrics] = useState([])
	async function handleCompare() {
		const token = localStorage.getItem('token')
		const res = await fetch('/api/superposition/compare', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ branches: branches.split(',').map(s => s.trim()) }) })
		const data = await res.json()
		if (res.ok) setMetrics(data.metrics)
	}
	return (
		<div className="p-6">
			<h1 className="text-xl mb-4">Superposition Branching</h1>
			<div className="flex gap-2 mb-3">
				<input className="px-3 py-2 bg-black/40 rounded" value={branches} onChange={e => setBranches(e.target.value)} />
				<button onClick={handleCompare} className="px-3 py-2 bg-quantum-accent/40 rounded">Compare</button>
			</div>
			<table className="w-full text-left">
				<thead><tr><th>Branch</th><th>Fidelity</th><th>Depth</th></tr></thead>
				<tbody>
					{metrics.map(m => (
						<tr key={m.branch}><td>{m.branch}</td><td>{m.fidelity.toFixed(3)}</td><td>{m.depth}</td></tr>
					))}
				</tbody>
			</table>
		</div>
	)
}