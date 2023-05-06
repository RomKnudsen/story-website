import mongoose from 'mongoose';

const homeText = new mongoose.Schema({
	title: {type: String, required: true},
	para: {type: String, required: true},
	coverPhoto: {
		public_id: String,
		url: String,
	},
	characters: [
		{
			name: String,
			image: {
				public_id: String,
				url: String
			}
		}
	]
},{timestamps: true});

export default mongoose.model('hometext', homeText);