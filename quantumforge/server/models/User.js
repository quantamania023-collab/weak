const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
	{
		username: { type: String, required: true },
		email: { type: String, required: true, unique: true, index: true },
		password: { type: String, required: true },
		verified: { type: Boolean, default: false },
		tags: { type: [String], default: [] },
		realms: { type: [mongoose.Schema.Types.ObjectId], ref: 'Realm', default: [] }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);