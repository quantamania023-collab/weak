import React, { useState } from 'react'

export default function Search() {
	const [q, setQ] = useState('entangled')
	const [results, setResults] = useState([])
	async function handleSearch() {
		const token = localStorage.getItem('token')
		const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } })
		const data = await res.json()
		if (res.ok) setResults(data.results)
	}
	return (
		<div className="p-6">
			<h1 className="text-xl mb-4">Quantum Search</h1>
			<div className="flex gap-2 mb-3">
				<input className="px-3 py-2 bg-black/40 rounded" value={q} onChange={e => setQ(e.target.value)} />
				<button onClick={handleSearch} className="px-3 py-2 bg-quantum-accent/40 rounded">Observe</button>
			</div>
			<ul className="space-y-2">
				{results.map(r => (
					<li key={r.id} className="p-3 bg-white/5 rounded border border-white/10">
						<div className="font-medium">{r.name || r.type}</div>
						<div className="text-xs opacity-70">score {r.score?.toFixed ? r.score.toFixed(2) : r.score}</div>
					</li>
				))}
			</ul>
		</div>
	)
}