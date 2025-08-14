import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
	return (
		<div className="min-h-screen px-6 py-8">
			<header className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold glow-text">QuantumForge</h1>
				<nav className="space-x-4">
					<Link to="/register" className="text-quantum-glow">Qubit Registration</Link>
					<Link to="/search" className="text-quantum-glow">Quantum Search</Link>
				</nav>
			</header>
			<section className="mt-10">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl">Your Quantum Realms</h2>
					<button className="px-3 py-2 bg-quantum-accent/30 rounded">Spawn Realm</button>
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{[1,2,3].map(i => (
						<Link key={i} to={`/realms/${i}`} className="p-4 rounded bg-white/5 border border-white/10 hover:border-quantum-glow/50">
							<h3 className="font-medium">Realm {i}</h3>
							<p className="opacity-70">Quantum circuits playground</p>
						</Link>
					))}
				</div>
			</section>
		</div>
	)
}