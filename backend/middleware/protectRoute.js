import User from "../models/user.model.js";
import jwt from 'jsonwebtoken';

export const protectRoute=async(req,res,next)=>{
    try{
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({error:"Unauthorised: No Token Provided"});
        }
        console.log("token is :",token);
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({error:"Invalid Token"});
        }
        console.log("decoded is : ",decoded);
        const user=await User.findById(decoded.id).select("-password");
        console.log("user is : ",user);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        req.user=user;
        next();
    }
    catch(error){
        console.log("Error in protectRoute middleware",error.message);
        console.log("jwt is : ".jwt);
        return res.status(500).json({error:"Internal Server Error"});
    }
}