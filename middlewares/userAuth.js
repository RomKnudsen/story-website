import UserModel from "../models/user.js";
import  jwt from "jsonwebtoken";
import sendResponse from '../utils/sendResponse.js';

const isUserAuthenticated = async (req, res, next) => {
  try{
    const { Usertoken } = req.cookies;
    if (!Usertoken) {
      return sendResponse(false, 401, 'Please login first', res);
    }

    const decoded = await jwt.verify(Usertoken, process.env.secret_key);
    const user = await UserModel.findById(decoded._id);
    // .populate({path: 'unlockCharacter.character'}).populate({path: 'unlockCloth.cloth'});

    if(!user){
      return sendResponse(false, 401, 'Please login first', res);
    }

    req.user = user;
    next();
  }catch(err){
    return sendResponse(false, 500, err.message, res);
  }
};

export default isUserAuthenticated;
