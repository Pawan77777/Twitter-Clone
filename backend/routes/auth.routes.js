import express from 'express';
import { getMe, loginHandler, logoutHandler, signupHandler } from '../controllers/auth.controller.js';

const router=express.Router();

router.get("/me",protectRoute,getMe);
router.post('/signup',signupHandler);
router.pst('/login',loginHandler);
router.post('/logout',logoutHandler);

export default router;