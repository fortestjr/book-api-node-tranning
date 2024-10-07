import express from 'express';
import authenticate from '../middlewares/auth.js';
import { createBook, deleteBook, getBookByUserId, getBooksByFIlter, updateBook , addBookToUserCollection } from '../controller/bookController.js';

const router = express.Router();

// Create a book
router.post('/', authenticate, createBook)
router.post('/:bookid' , authenticate , addBookToUserCollection)

// Get all books for a user
router.get('/', getBooksByFIlter)

router.get('/:userid', authenticate, getBookByUserId)

// Update a book
router.put('/:id', authenticate, updateBook)
// Delete a book
router.delete('/:id', authenticate, deleteBook)

export default router
