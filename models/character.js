import mongoose from 'mongoose';

const characterNameSchema = new mongoose.Schema({
	name: {type: String, required: true},
	image: {
		public_id: String,
		url: String,
	}
});

export default mongoose.model('characterImage', characterNameSchema);