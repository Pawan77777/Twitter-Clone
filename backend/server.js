import express from 'express';
import authRoutes from './routes/auth.route.js';
import postRoutes from './routes/post.route.js'
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';
import userRoutes from './routes/user.route.js'
import {v2 as cloudinary} from "cloudinary"
import notificationRoutes from './routes/notification.route.js'
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app=express();
app.use(cookieParser()); 
app.use(express.json({ limit: "10mb" })); // limit shouldnt be to large to prevent DOS attacks
app.use(express.urlencoded({ limit: "10mb", extended: true })); // to parse URL-encoded data
const PORT=process.env.PORT || 3000;
cloudinary.config({
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret:process.env.CLOUDINARY_API_SECRET,
}
);

app.use('/api/auth',authRoutes);
app.use('/api/users',userRoutes);
app.use('/api/posts',postRoutes);
app.use('/api/notifications',notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(__dirname, '../frontend/dist');
  app.use(express.static(frontendDist));

  // Create a router for fallback
  const fallbackRouter = express.Router();
  fallbackRouter.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });

  app.use(fallbackRouter);
}



app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})