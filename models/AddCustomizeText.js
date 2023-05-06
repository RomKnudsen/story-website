import mongoose from 'mongoose';

const characterText = new mongoose.Schema({
	title: {type: String, required: true},
	para: {type: String, required: true}
},{timestamps: true});

export default mongoose.model('charactertext', characterText);