const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
	{
		name: String,
		path: String,
		language: String,
		size: Number
	},
	{ _id: false }
);

const RealmSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		description: { type: String, default: '' },
		owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		files: { type: [FileSchema], default: [] },
		defaultBranch: { type: String, default: 'main' },
		gitDir: { type: String, required: true }
	},
	{ timestamps: true }
);

module.exports = mongoose.model('Realm', RealmSchema);