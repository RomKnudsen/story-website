import mongoose from 'mongoose';

const globalVaribleSchema = new mongoose.Schema({
	name: String,
	value: String
},{timestamps: true});

export default mongoose.model('globalVarible', globalVaribleSchema);