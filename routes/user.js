import express from 'express';
import authenticate from '../middlewares/auth.js';
import { getMyBooks, register , logIn } from '../controller/userController.js';
import { addBookToUserCollection } from '../controller/bookController.js';

const router = express.Router();

// User Registration
router.post('/register', register)

// User Login
router.post('/login', logIn)

router.get("/" , authenticate , getMyBooks)
router.post('/book/:bookid' , authenticate , addBookToUserCollection)


export default router;
