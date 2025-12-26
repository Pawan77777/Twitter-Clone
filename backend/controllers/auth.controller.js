export const signupHandler = async (req,res)=>{
    res.json({message:"SIgnup ROute called",data:"Signup data"})
}; 

export const loginHandler = async (req,res)=>{
    res.json({message:"Login Route called",data:"Login data"});
}

export const logoutHandler = async (req,res)=>{
    res.json({message:"Logout Route called",data:"Logout data"});
}