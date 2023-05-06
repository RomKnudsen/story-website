import mongoose from 'mongoose';
import  { hash, compare } from "bcrypt";
import characterModel from './character.js';
import clothModel from './cloth.js';

const userSchema = new mongoose.Schema({
	name: {type: String, required: true},
	email: {type: String, required: true, unique: true},
	password: {type: String, required: true, select : false},
	unlockCharacter: [{name: String, active: {type: Boolean, default: true}, characterName: String, characterPronoun: String, gender: String, variable: [{name: String, value: String}]}],
	variable: [{name: String, value: String}],
	gender: {type: String, required: true},
	character: [{name: String, active: {type: Boolean, default: true}, characterName: String, characterPronoun: String,gender: String, variable: [{name: String, value: String}]}],
	passwordResetToken: {type: String, default: undefined},
    passwordResetExpire: {type: Date, default: undefined}
},{timestamps: true});

userSchema.pre("save",async function (next) {
	try {
		if(this.isModified("password")){
			this.password = await hash(this.password,10);
		}
		next();
	}catch(err){
		console.log(err.message);
	};
});

export default mongoose.model('user', userSchema);