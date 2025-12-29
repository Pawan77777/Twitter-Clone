import express from 'express';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js'
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.routes.js'
import {v2 as cloudinary} from "cloudinary"

const app=express();
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended:true})); // to parse URL-encoded data
const PORT=process.env.PORT || 3000;
dotenv.config();
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
}
);

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})

// kQmJGRQO4evJrGn3
// pawanchoubey408_db_user