import express from 'express';
import authenticate from '../middlewares/auth.js';
import { createBook, deleteBook, getBookByUserId, getBooksByFIlter, updateBook , addBookToUserCollection } from '../controller/bookController.js';
import authorize from '../middlewares/authorizing.js';

const router = express.Router();

// Create a book
router.post('/', authorize, createBook)
router.post('/:bookid' , authenticate , addBookToUserCollection)

// Get all books for a user
router.get('/', getBooksByFIlter)

router.get('/:userid', authenticate, getBookByUserId)

// Update a book
router.patch('/:bookid', authorize, updateBook)
// Delete a book
router.delete('/:bookid', authorize , deleteBook)

export default router
