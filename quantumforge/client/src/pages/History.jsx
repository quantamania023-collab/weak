import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function History() {
	const { id } = useParams()
	const [states, setStates] = useState([])
	useEffect(() => {
		const token = localStorage.getItem('token')
		fetch(`/api/history?realmId=${id}`, { headers: { Authorization: `Bearer ${token}` }})
			.then(r => r.json()).then(d => setStates(d.states || []))
	}, [id])
	return (
		<div className="p-6">
			<h1 className="text-xl mb-4">Timeline Observation</h1>
			<ul className="space-y-2">
				{states.map(s => (
					<li key={s._id} className="p-3 bg-white/5 rounded border border-white/10">
						<div className="font-medium">{s.message}</div>
						<div className="text-xs opacity-70">Commit {s.commitId} • shots {s.shots}</div>
					</li>
				))}
			</ul>
		</div>
	)
}