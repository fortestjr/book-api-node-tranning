import express from 'express';
import authenticate from '../middlewares/auth.js';
import { getMyBooks, register , logIn } from '../controller/userController.js';

const router = express.Router();

// User Registration
router.post('/register', register)

// User Login
router.post('/login', logIn)

router.get("/:userid" , authenticate , getMyBooks)

export default router;
