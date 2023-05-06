import mongoose from 'mongoose';

const clothSchema = new mongoose.Schema({
	title: {type: String, required: true, unique: true},
	name: {type: String, required: true},
	image: {
		public_id: {type: String, required: true},
		url: {type: String, required: true}
	}
},{timestamps: true});

export default mongoose.model('cloth', clothSchema);