import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles/tailwind.css'
import Home from './pages/Home'
import Register from './pages/Register'
import Realm from './pages/Realm'
import History from './pages/History'
import Compare from './pages/Compare'
import Mitigation from './pages/Mitigation'
import Search from './pages/Search'

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/register" element={<Register />} />
				<Route path="/realms/:id" element={<Realm />} />
				<Route path="/realms/:id/history" element={<History />} />
				<Route path="/realms/:id/compare" element={<Compare />} />
				<Route path="/realms/:id/mitigation" element={<Mitigation />} />
				<Route path="/search" element={<Search />} />
			</Routes>
		</BrowserRouter>
	)
}

createRoot(document.getElementById('root')).render(<App />)