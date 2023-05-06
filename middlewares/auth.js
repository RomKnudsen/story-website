import AdminModel from "../models/admin.js";
import  jwt from "jsonwebtoken";
import sendResponse from '../utils/sendResponse.js';

const isAuthenticated = async (req, res, next) => {
  try{
    const { token } = req.cookies;
    if (!token) {
      return sendResponse(false, 401, 'Invalid token', res);
    }

    const decoded = await jwt.verify(token, process.env.secret_key);
    const admin = await AdminModel.findById(decoded._id);

    if(!admin){
      return sendResponse(false, 401, 'Invalid token', res);
    }

    req.admin = admin;
    next();
  }catch(err){
    return sendResponse(false, 500, err.message, res);
  }
};

export default isAuthenticated;
