import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Register() {
	const [username, setUsername] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const navigate = useNavigate()

	async function handleRegister() {
		setError('')
		if (password.length < 8) return setError('Decoherence detected: Weak password')
		try {
			const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) })
			const data = await res.json()
			if (!res.ok) throw new Error(data.error || 'Registration failed')
			localStorage.setItem('token', data.token)
			navigate('/')
		} catch (e) {
			setError(e.message)
		}
	}

	return (
		<div className="min-h-screen px-6 py-8 flex items-center justify-center">
			<div className="w-full max-w-md bg-white/5 border border-white/10 rounded p-6">
				<h2 className="text-xl mb-4">Qubit Registration</h2>
				<div className="space-y-3">
					<input aria-label="username" className="w-full px-3 py-2 bg-black/40 rounded" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} />
					<input aria-label="email" className="w-full px-3 py-2 bg-black/40 rounded" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
					<input aria-label="password" className="w-full px-3 py-2 bg-black/40 rounded" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
					{error && <div className="text-red-400">{error}</div>}
					<button onClick={handleRegister} className="w-full px-3 py-2 bg-quantum-accent/40 rounded">Entangle Account</button>
				</div>
			</div>
		</div>
	)
}