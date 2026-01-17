import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import {v2 as cloudinary} from 'cloudinary';

export const createPost=async(req,res)=>{
    try{
        const {text}=req.body;
        let {img}=req.body;
        const userId=req.user._id.toString();
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({message:"User not Found"});
        }
        if(!text && !img){
            return res.status(400).json({error:"Post must have text or image"});
        }
        let image="";
        if(img){
            const uploadedResponse=await cloudinary.uploader.upload(img);
            image=uploadedResponse.secure_url;
        }

        const newPost=new Post({
            user:userId,
            text,
            image
        });
        await newPost.save();
        return res.status(201).json(newPost);
    }
    catch(error){
        console.log(" Error in createPost : ",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const deletePost=async(req,res)=>{
    try {
        const postId=req.params.id;
        const post=await Post.findById(postId);
        if(!post)
            return res.status(404).json({error:"Post not found"});

        if(post.user.toString() !== req.user._id.toString())
            return res.status(401).json({error:"You are not authorized to delete this post"});

        if(post.img){
            const imgId=post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imgId);
        }

        await Post.findByIdAndDelete(postId);
        return res.status(200).json({message:"Post Deleted Successfully"});
    }
    catch(error){
        console.log("Error in delete post : ",error);
        return res.status(500).json({error:"Internal Server Errror"});
    }
}

export const commentOnPost=async(req,res)=>{
    try {
        const {text}=req.body;
        const postId=req.params.id;
        const userId=req.user._id;
        if(!text)
            return res.status(400).json({error:"Text field is required"});
        
        const post=await Post.findById(postId);
        if(!post)
            return res.status(404).json({error:"Post not found"});

        const comment={
            user:userId,
            text
        }
        post.comments.push(comment);
        await post.save();
        return res.status(200).json(post);
    }
    catch(error){
        console.log("Error in CommentOnPost : ",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const likeUnlikePost=async(req,res)=>{
    try{
        const userId=req.user._id;
        const {id:postId}=req.params;
        const post=await Post.findById(postId);
        if(!post)
            return res.status(404).json({message:"Post not found"});
        // const userLikedPost=post.likes.includes(userId);

        const userLikedPost=post.likes.some(
            id=>id.toString()==userId.toString()
        )
        if(userLikedPost){
            // Unlike Post
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $pull: { likes: userId } },
                { new: true }
            );
            // const updatedLikes = updatedPost.likes;
            await User.updateOne({_id:userId},{$pull:{likedPosts:postId}})
            await Notification.deleteOne({
                from:userId,
                to:post.user,
                type:"like",
                post:postId,
            });
            const updatedLikes = updatedPost.likes.filter(id => id.toString() !== userId.toString());
            return res.status(200).json(updatedLikes);
        }
        else{
            //Like Post
            // post.likes.push(userId);
            // await Post.updateOne(
            //     {_id:postId},
            //     {$addToSet:{likes:userId}} // Prevent Duplicates
            // );
            const updatedPost = await Post.findByIdAndUpdate(
                postId,
                { $addToSet: { likes: userId } },
                { new: true }
            );
            const updatedLikes = updatedPost.likes;
            await User.updateOne({_id:userId},{$push:{likedPosts:postId}});
            if(post.user.toString()!== userId.toString()){ // Prevent notifying yourself
                await Notification.create({
                    from:userId,
                to:post.user,
                type:"like",
                post:postId
                })
            }
            // const updatedLikes=post.likes
            return res.status(200).json(updatedLikes);
        }
    }
    catch(error){
        console.log("Error in likeUnlikePost :",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const getAllPosts=async(req,res)=>{
    try{
        const posts=await Post.find().sort({createdAt:-1}).populate({
            path:"user",
            select:"-password",
        })
        .populate({
            path:"comments.user",
            select:"-password",
        });
        if(posts.length===0)
            return res.status(200).json([]);
        return res.status(200).json(posts);
    } catch(error){
        console.log("Error in getAllPosts :",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const getLikedPosts=async(req,res)=>{
    const userId=req.params.id;
    try{
        const user=await User.findById(userId);
        if(!user)
            return res.status(404).json({error:"User not found"});

        const likedPosts=await Post.find({_id:{$in:user.likedPosts}})
        .populate({
            path:"user",
            select:"-password"
        }).populate({
            path:"comments.user",
            select:"-password"
        });
        return res.status(200).json(likedPosts);

    }catch(error){
        console.log("Error in getLikedPosts :",error);
        return res.status(500).json({error:"Internal Server Error "});
    }
}

export const getFollowingPosts=async(req,res)=>{
    try {
        const userId=req.user._id;
        const user=await User.findById(userId);
        if(!user)
            return res.status(404).json({error:"User not found"});

        const following=user.following;
        const feedPosts=await Post.find({user:{$in:following}})
        .sort({createdAt :-1})
        .populate({
            path:'user',
            select:"-password",
        })
        .populate({
            path:"comments.user",
            select:"-password",
        });
        return res.status(200).json(feedPosts);
    }catch(error){
        console.log("Error in getFollowing Posts :",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}

export const getUserPosts=async(req,res)=>{
    try{
            const {username}=req.params;
        const user=await User.findOne({userName:username});
        if(!user)
            return res.status(404).json({error:"User not found"});

        const posts=await Post.find({user:user._id})
        // .sort({createdAt:-1})
        .populate({
            path:"user",
            select:"-password",
        }).populate({
            path:"comments.user",
            select:"-password",
        });
        return res.status(200).json(posts);
    }catch(error){
        console.log("Error in getUserPosts :",error);
        return res.status(500).json({error:"Internal Server Error"});
    }
}