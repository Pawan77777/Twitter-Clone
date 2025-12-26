import express from 'express';
import authRoutes from './routes/auth.routes.js';
import dotenv from 'dotenv';
import connectMongoDB from './db/connectMongoDB.js';
import cookieParser from 'cookie-parser';

const app=express();
app.use(express.json());
app.use(cookieParser()); 
app.use(express.urlencoded({extended:true})); // to parse URL-encoded data
const PORT=process.env.PORT || 3000;
dotenv.config();

app.use('/api/auth',authRoutes);

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
})

// kQmJGRQO4evJrGn3
// pawanchoubey408_db_user