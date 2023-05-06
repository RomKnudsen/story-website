import catchAsyncError from '../middlewares/catchAsyncError.js';
import AdminModel from '../models/admin.js'; 
import sendResponse from '../utils/sendResponse.js';
import { compare } from "bcrypt";
import validator from 'validator';
import jwt from "jsonwebtoken";


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

// export const register = catchAsyncError(async (req, res) => {
// 	const {name, username, password} = req.body;

// 	if(!name, !username, !password){
// 		return sendResponse(false, 401, 'all field are required',res);
// 	}

// 	const user = await AdminModel.create(req.body);

// 	sendResponse(true, 201, 'Register Successfully', res);
// });


export const login = catchAsyncError(async (req, res) => {
	const {email, password} = req.body;
	const admin = await AdminModel.findOne({email}).select("+password");

	if(!admin){
		return sendResponse(false, 404, 'Invalid details', res);
	}

	const isMatch = await comaprePass(password,admin.password);

	if(!isMatch){
		return sendResponse(false, 404, 'Invalid details', res);
	}

	const token = await genToken(admin._id);

	const options = {
      	expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      	httpOnly: true,
    };

    res.status(200).cookie("token", token, options).json({
      	success: true,
      	isAdmin: true,
      	admin,
      	message: 'Login successfully'
    });

});


export const loadAdmin = catchAsyncError(async (req, res) => {
	if(!req.admin){
		return sendResponse(false, 404, 'Invalid token', res);
	}

	res.status(200).json({
		success: true,
		isAdmin: true,
		admin: req.admin
	});
});