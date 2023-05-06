import catchAsyncError from '../middlewares/catchAsyncError.js';
import UserModel from '../models/user.js'; 
import variableModel from '../models/globalVariable.js';
import sendResponse from '../utils/sendResponse.js';
import { compare } from "bcrypt";
import validator from 'validator';
import jwt from "jsonwebtoken";
import clothModel from '../models/cloth.js';
import characterModel from '../models/character.js';
import {wooCommerce} from '../utils/woocommerce.js';
import mailer,{mailText} from '../middlewares/mailer.js';
import crypto from 'crypto';


const genrateResetToken = async (user) => {
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetDate = Date.now() + 10 * 60 * 1000;
    user.passwordResetExpire = resetDate;
    return resetToken;
}



const findIndex = (name, arr) => {
	let index;
	for(let i=0; i<arr.length; i++){
		if(arr[i].name.toLowerCase() == name.toLowerCase()){
			index = i;
			break;
		}
	}

	return index;
}

const comaprePass = async function (Password,DataPassword) {
  return await compare(Password, DataPassword);
};


const genToken = async (_id) => {
	try {
		 return jwt.sign({_id}, process.env.secret_key);
	}catch(err){
		console.log(err.message);
	}
}

export const userRegister = catchAsyncError(async (req, res) => {
	const {name, email, password, gender} = req.body;

	if(!name || !email || !password || !gender){
		return sendResponse(false, 401, 'all field are required',res);
	}

	if(!validator.isEmail(email))
	{
		return sendResponse(false, 401, 'Enter valid email', res);
	}

	const globalVariable = await variableModel.find();

	req.body.variable = [];
	req.body.variable.push({name: 'name input',value: ''});
	req.body.variable.push({name: 'pronoun input', value: ''});
	if(gender == 'girl'){
		req.body.character = [{name: 'girl', active: true, characterName: '', characterPronoun: '',gender: '', variable: globalVariable}];
	}else{
		req.body.character = [{name: 'boy', active: true, characterName: '', characterPronoun: '',gender: '', variable: globalVariable}];
	}

	const unlockCharacter = [
		{name: 'girl', active: true, characterName: '', characterPronoun: '',gender: '', variable: globalVariable},
		{name: 'boy', active: true, characterName: '', characterPronoun: '',gender: '', variable: globalVariable}
	]

	req.body.unlockCharacter = unlockCharacter;
	const user = await UserModel.create(req.body);

	const Usertoken = await genToken(user._id);

	const options = {
      	expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      	httpOnly: true,
    };

    res.status(200).cookie("Usertoken", Usertoken, options).json({
      	success: true,
      	user,
      	isAuth: true,
      	message: 'Register Successfully'
    });
});


export const userLogin = catchAsyncError(async (req, res) => {
	const {email, password} = req.body;
	const user = await UserModel.findOne({email}).select("+password");

	if(!user){
		return sendResponse(false, 404, 'Invalid details', res);
	}

	const isMatch = await comaprePass(password,user.password);

	if(!isMatch){
		return sendResponse(false, 404, 'Invalid details', res);
	}

	const Usertoken = await genToken(user._id);

	const options = {
      	expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      	httpOnly: true,
    };

    res.status(200).cookie("Usertoken", Usertoken, options).json({
      	success: true,
      	user,
      	isAuth: true,
      	message: 'Login successfully'
    });

});

export const loadUser = catchAsyncError(async (req, res) => {
	if(!req.user){
		return sendResponse(false, 404, 'Invalid token', res);
	}

	res.status(200).json({
		success: true,
		user: req.user,
		isAuth: true
	});
});

export const unlockCharacter = catchAsyncError(async (req, res) => {
	const {orderId, uniqeKey} = req.body;
	const user = await UserModel.findById(req.user._id);
	wooCommerce.get(`orders/${orderId}`, async function(err, data) {
		
		data = JSON.parse(data.body);
		if(data?.data?.status === 404){
			return sendResponse(false, 404, 'Invalid orderId',res);
		}

		if(data['order_key'] !== uniqeKey){
			return sendResponse(false, 404, 'Invalid order key',res);
		}

		const globalVariable = await variableModel.find();

		for(let i=0; i < data['line_items']?.length; i++){
			const isInclude = user.unlockCharacter.some(obj => obj.name === data['line_items'][i].name);
			if(!isInclude){
				const active = data['line_items'][i].name.split().length == 1;
				user.unlockCharacter.push({name: data['line_items'][i].name, active, characterName: '', characterPronoun: '', variable: globalVariable});
			}
		}

		await user.save();
		return sendResponse(true, 200, 'unlock successfully', res);
	});
});


export const logoutUser = catchAsyncError(async (req, res) => {
	const { Usertoken } = req.cookies;
  if (!Usertoken) {
     return sendResponse(false, 401, 'Please login first', res);
  }
  res.status(200).clearCookie('Usertoken').json({
  	message: 'Logout Successfully',
  	success: true
  })

})

export const updateUnlockCharacter = catchAsyncError(async (req, res) => {
	const {updateCharacter, name, pronoun, variable, gender} = req.body;
	console.log(gender)
	const user = await UserModel.findById(req.user._id);
	for(let i=0; i<updateCharacter.length; i++){
		let updateName = updateCharacter[i].name;
		const index = findIndex(updateName, user.unlockCharacter);
		if(index !== undefined){
			user.unlockCharacter[index].active = updateCharacter[i]?.active;
			user.unlockCharacter[index].characterName = name;
			user.unlockCharacter[index].characterPronoun = pronoun;
			user.unlockCharacter[index].variable = variable;
			user.unlockCharacter[index].gender = gender;
		}	
	}

	const isSelected = user.character[0].name == updateCharacter[0].name
	if(isSelected){
		updateCharacter[0].variable = variable;
		user.character = updateCharacter;
		user.character[0].gender = gender;
		const variable2 = [{name: 'name input',value: name},{name: 'pronoun input',value: pronoun}];
		user.variable = variable2;
	}

	await user.save();

	return sendResponse(true, 200, 'character set successfully', res);
});



export const selectCharacter = catchAsyncError(async (req, res) => {
	let {character} = req.body;
	const user = await UserModel.findById(req.user._id);
	for(let i=0; i<character.length; i++){
		delete character[i].image;
	}
	user.character = character;
	const variable = [{name: 'name input',value: character[0]?.characterName},{name: 'pronoun input',value: character[0]?.characterPronoun}];
	user.variable = variable;
	await user.save();

	return sendResponse(true, 200, undefined, res);
});


export const updateProfile = catchAsyncError(async (req,res) => {
	const {name, email,password} = req.body;
	const user = await UserModel.findById(req.user._id).select('+password');
	user.name = name;
	user.email = email;
	if(password){
		user.password = password;
	}
	await user.save();
	sendResponse(true, 200, 'Update successfully', res);
});

export const updatePassword = catchAsyncError(async (req,res) => {
	const {newPassword, oldPassword} = req.body;
	const user = await UserModel.findById(req.user._id).select('+password');

	const isMatch = await comaprePass(oldPassword,user.password);
	if(!isMatch){
		return sendResponse(false,401,'Incorrect old password', res);
	}

	user.password = newPassword;
	await user.save();
	sendResponse(true, 200,'Update successfully', res);
});



// password forgot 

export const forgotPassword = catchAsyncError(async (req,res) => {

	const {email} = req.body;

	if(!email){
		return sendResponse(false,403,'please enter your emial',res);
	}

	const user = await UserModel.findOne({email});

	if(!user){
		return sendResponse(false,404,'user not exist',res);
	}

	const resetToken = await genrateResetToken(user);
	await user.save();

	const resetUrl = `${req.protocol}://${req.hostname}/reset-password/${resetToken}`;
	const subject = 'FairyTailored Password reset link';
    const text = `your password reset link is \n ${resetUrl}`;
    // const text = await mailText(resetUrl,req.hostname);
    try{
    	const send = await mailer(email,subject,text);
    	if(!send){
    		user.passwordResetToken = undefined;
    		user.passwordResetExpire = undefined;
    		await user.save();
        return sendResponse(false, 501, "mail sending failed please try again", res);
       }

        return sendResponse(true,200,'Password reset link send successfully on yout email', res);

    }catch(err){
    	console.log('err',err)
    	user.passwordResetToken = undefined;
    	user.passwordResetExpire = undefined;
    	await user.save();
      return sendResponse(false,501, err.message, res);
    }

});

// reset password 

export const resetPassword = catchAsyncError(async(req,res) => {

	const {token,newPassword} = req.body;

	if(!token){
		return sendResponse(false,403,'please enter your token', res);
	}

	const encryptToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = await UserModel.findOne({passwordResetToken: encryptToken,passwordResetExpire: {$gt: Date.now()}});


    if(!user){
    	return sendResponse(false,403,'invalid token or token has been expire',res);
    }

    if(!newPassword){
    	return sendResponse(false,403,'please fill new password',res);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    await user.save();

    sendResponse(true,200,'password reset successfully',res);
});