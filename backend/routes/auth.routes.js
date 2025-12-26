import express from 'express';
import { loginHandler, logoutHandler, signupHandler } from '../controllers/auth.controller.js';

const router=express.Router();

router.post('/signup',signupHandler);

router.get('/login',loginHandler);

router.get('/logout',logoutHandler)

export default router;