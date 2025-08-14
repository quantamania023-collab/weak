import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Mitigation() {
	const { id } = useParams()
	const [commitId, setCommitId] = useState('latest')
	const [results, setResults] = useState([])
	const [suggestion, setSuggestion] = useState('')
	async function analyze() {
		const token = localStorage.getItem('token')
		const res = await fetch('/api/mitigation/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ commitId }) })
		const data = await res.json()
		if (res.ok) { setResults(data.results); setSuggestion(data.suggestion) }
	}
	return (
		<div className="p-6">
			<h1 className="text-xl mb-4">Error Mitigation Dashboard</h1>
			<div className="flex gap-2 mb-3">
				<input className="px-3 py-2 bg-black/40 rounded" value={commitId} onChange={e => setCommitId(e.target.value)} />
				<button onClick={analyze} className="px-3 py-2 bg-quantum-accent/40 rounded">Analyze</button>
			</div>
			<ul className="space-y-2">
				{results.map(r => (
					<li key={r.technique} className="p-3 bg-white/5 rounded border border-white/10">
						<div className="font-medium">{r.technique}</div>
						<div className="text-xs opacity-70">error rate {r.errorRate}</div>
					</li>
				))}
			</ul>
			{suggestion && <div className="mt-4 p-3 bg-quantum-accent/10 border border-quantum-accent/30 rounded">{suggestion}</div>}
		</div>
	)
}