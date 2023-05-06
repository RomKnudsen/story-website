import mongoose from 'mongoose';

import  { hash, compare } from "bcrypt";

const AdminSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true, select : false}
},{timestamps: true});

AdminSchema.pre("save",async function (next) {
	try {
		if(this.isModified("password")){
			this.password = await hash(this.password,10);
		}
		next();
	}catch(err){
		console.log(err.message);
	};
});


export default mongoose.model('admin', AdminSchema);