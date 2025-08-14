const mongoose = require('mongoose');

const StateSchema = new mongoose.Schema(
	{
		realmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Realm', required: true, index: true },
		commitId: { type: String, required: true },
		branch: { type: String, default: 'main' },
		code: { type: String, required: true },
		message: { type: String, required: true },
		shots: { type: Number, default: 1024 },
		qubits: { type: Number, default: 0 },
		stateData: { type: Object, required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('State', StateSchema);