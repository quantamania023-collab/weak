/* eslint-disable */
(async () => {
	const localtunnel = require('localtunnel');
	const port = parseInt(process.env.PORT || '4000', 10);
	const tunnel = await localtunnel({ port });
	console.log(`TUNNEL_URL=${tunnel.url}`);
	tunnel.on('close', () => {
		console.log('Tunnel closed');
		process.exit(1);
	});
	process.on('SIGINT', async () => {
		await tunnel.close();
		process.exit(0);
	});
	// keep alive
	setInterval(() => {}, 1 << 30);
})();