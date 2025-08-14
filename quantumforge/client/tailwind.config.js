/* eslint-disable */
/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				quantum: {
					bg: '#0b1020',
					accent: '#8a2be2',
					glow: '#39ff14'
				}
			}
		}
	},
	plugins: []
};