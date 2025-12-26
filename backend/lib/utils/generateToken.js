import jwt from 'jsonwebtoken';

export const generateToken=(userId)=>{
    const token=jwt.sign({id:userId},process.env.JWT_SECRET,{
        expiresIn:'7d',
    });
    return token;
};

export const generateTokenAndSetCookie=(userId,res)=>{
    const token=generateToken(userId);
    res.cookie('jwt',token,{
        httpOnly:true, // prevents client-side JS from reading the cookie
        secure:process.env.NODE_ENV==='production',
        sameSite:'strict',
        maxAge:7*24*60*60*1000, // 7 days
    });
    return token;
};