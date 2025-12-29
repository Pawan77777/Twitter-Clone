import Notification from "../models/notification.model.js";

export const getNotifications=async(req,res)=>{
    try{
        const userId=req.user._id;
        const notifications=await Notification.find({to:userId}).populate({
            path:"from",
            select: "userName profileImage",
        });

        await Notification.updateMany({to:userId},{$set:{read:true}});
        return res.status(200).json(notifications);
    }catch(error){
        console.log("Error in getNotification :",error.message);
        return res.status(500).json({error:"Internal Server Error"})
    }
}

export const deleteNotifications=async(req,res)=>{
    try{
        const userId=req.user._id;
        await Notification.deleteMany({to:userId});
        return res.status(200).json({message:"Notifications deleted successfully"});
    }catch(error){
        console.log("Error in Delete Notifications :",errror);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const deleteNotification=async(req,res)=>{
    try {
        const {id:notificationId}=req.params;
        const userId=req.user._id;
        const notification=await Notification.findById(notificationId);
        if(!notification)
            return res.status(404).json({error:"Notifications not found"});

        if(notification.to.toString() !== userId.toString())
            return res.status(403).json({error:"You are not allowed to delete this notification "});
        await Notification.findByIdAndDelete(notificationId);
        return res.status(200).json({message:"Notification deleted Successfully"});
    }catch(error){
        console.log("Error in delete Notification :",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}