import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function CircuitCanvas() {
	const ref = useRef(null)
	useEffect(() => {
		const el = ref.current
		const scene = new THREE.Scene()
		const camera = new THREE.PerspectiveCamera(75, el.clientWidth / 200, 0.1, 1000)
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
		renderer.setSize(el.clientWidth, 200)
		el.appendChild(renderer.domElement)
		const particles = new THREE.Group()
		for (let i = 0; i < 64; i++) {
			const geo = new THREE.SphereGeometry(0.03, 8, 8)
			const mat = new THREE.MeshBasicMaterial({ color: 0x39ff14 })
			const mesh = new THREE.Mesh(geo, mat)
			mesh.position.set((Math.random()-0.5)*4, (Math.random()-0.5)*1, (Math.random()-0.5)*1)
			particles.add(mesh)
		}
		scene.add(particles)
		camera.position.z = 2
		let raf
		const animate = () => {
			particles.rotation.y += 0.002
			raf = requestAnimationFrame(animate)
			renderer.render(scene, camera)
		}
		animate()
		return () => { cancelAnimationFrame(raf); renderer.dispose(); el.innerHTML = '' }
	}, [])
	return <div ref={ref} className="w-full rounded border border-white/10" />
}