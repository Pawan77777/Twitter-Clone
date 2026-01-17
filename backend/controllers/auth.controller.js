import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';

export const signupHandler = async (req,res)=>{
    try {
        const {fullName,userName,email,password}=req.body;
        const emailRegex=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error:"Invalid email format"});
        }
        const existingUser=await User.findOne({userName:userName});
        if(existingUser){
            return res.status(400).json({error:"userName is already taken"});
        }
        const existingEmail=await User.findOne({email:email});
        if(existingEmail){
            return res.status(400).json({error:"Email is already taken"});
        }
        if(password.length<6){
            return res.status(400).json({error:"Password must be at least 6 characters long"});
        }
        // Hash password so that even if the user database is compromised, the attackers cannot see the actual passwords.
        const salt=bcrypt.genSaltSync(10);
        const hashedPassword=bcrypt.hashSync(password,salt);
        const newUser=new User({
            fullName,
            userName,
            email,
            password:hashedPassword
        });
        if(newUser){
            generateTokenAndSetCookie(newUser._id,res);
            await newUser.save();
            return res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                userName:newUser.userName,
                followers:newUser.followers,
                following:newUser.following,
                profileImage:newUser.profileImage,
                coverImage:newUser.coverImage,
                bio:newUser.bio,
                link:newUser.link,
            });
        }
        else{
            return res.status(400).json({message:"Error in creating user"});
        }
    }
    catch(error){
        console.log("Error in signupHandler:",error.message);
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
}; 

export const loginHandler = async (req,res)=>{
    try{
        const {userName,password}=req.body;
        const user=await User.findOne({userName:userName});
        if(!user){
            return res.status(400).json({message:"Invalid userName "});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password||"");
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid password"});
        }
        generateTokenAndSetCookie(user._id,res);
        return res.status(200).json({
            _id:user._id,
            fullName:user.fullName,
            userName:user.userName,
            email:user.email,
            followers:user.followers,
            following:user.following,
            profileImage:user.profileImage,
            coverImage:user.coverImage,
            bio:user.bio,
            link:user.link,
        })
    }
    catch(error){
        console.log("Error in loginHandler:",error.message);
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
}

export const logoutHandler = async (req,res)=>{
    try {
        res.cookie("jwt","",{maxAge:0,httpOnly:true});
        return res.status(200).json({message:"Logged out successfully"});
    }catch(error){
        console.log("Error in logout Handler:",error.message);
        res.status(500).json({message:"Internal Server Error",error:error.message});
    }
};

export const getMe = async (req,res) =>{
    try {
        const user=await User.findById(req.user._id).select("-password");
        res.status(200).json(user);
    }
    catch(err){
        console.log("Error in getMe controller",err.message);
        res.status(500).json({error:"Internal Server Error"});
    }
}