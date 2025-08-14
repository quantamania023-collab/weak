import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import CircuitCanvas from '../components/CircuitCanvas'

export default function Realm() {
	const { id } = useParams()
	const [message, setMessage] = useState('')
	const [code, setCode] = useState('OPENQASM 2.0; qreg q[2]; h q[0]; cx q[0],q[1];')
	const [result, setResult] = useState(null)

	async function collapseState() {
		const token = localStorage.getItem('token')
		const res = await fetch('/api/collapse-state', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ realmId: id, filepath: 'bell.qasm', message }) })
		const data = await res.json()
		if (res.ok) setResult(data.state)
	}

	return (
		<div className="min-h-screen p-6 space-y-4">
			<CircuitCanvas />
			<div className="flex items-center justify-between">
				<h1 className="text-xl">Realm {id}</h1>
				<div className="space-x-3">
					<Link className="underline" to={`/realms/${id}/history`}>Timeline</Link>
					<Link className="underline" to={`/realms/${id}/compare`}>Superposition</Link>
					<Link className="underline" to={`/realms/${id}/mitigation`}>Mitigation</Link>
				</div>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
				<div className="space-y-2">
					<textarea className="w-full h-64 bg-black/40 rounded p-2" value={code} onChange={e => setCode(e.target.value)} />
					<input className="w-full px-3 py-2 bg-black/40 rounded" placeholder="Collapse message" value={message} onChange={e => setMessage(e.target.value)} />
					<button onClick={collapseState} className="px-3 py-2 bg-quantum-accent/40 rounded">Collapse State</button>
				</div>
				<div className="bg-white/5 border border-white/10 rounded p-3">
					<h3 className="mb-2">State Distribution</h3>
					<pre className="text-xs overflow-auto max-h-64">{result ? JSON.stringify(result.stateData, null, 2) : 'No collapse yet'}</pre>
				</div>
			</div>
		</div>
	)
}