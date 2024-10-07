import sql from 'mssql'
import connectDb from '../db/db.js'
import dotenv from 'dotenv'
dotenv.config()

export const createBook = async (req, res) => {
    const { title, author, genre, description } = req.body;
    const pool = await connectDb();

    try {
        const result = await pool.request()
            .input('userid', req.user.userid)
            .input('title', title)
            .input('author', author)
            .input('genre', genre)
            .input('description', description)
            .query('INSERT INTO books (userid, title, author, genre, description) VALUES (@userid, @title, @author, @genre, @description); SELECT SCOPE_IDENTITY() AS bookid;');

        res.status(201).json({ bookid: result.recordset[0].bookid, title });
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Failed to create book.' });
    }
}

export const getBookByUserId =  async (req, res) => {
    const pool = await connectDb();

    try {
        const result = await pool.request()
            .input('userid', req.params.userid)
            .query('SELECT * FROM books WHERE userid = @userid;');
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books.' });
    }
}

export const updateBook =  async (req, res) => {
    const { id } = req.params;
    const { title, author, genre, description } = req.body;
    const pool = await connectDb();

    try {
        const result = await pool.request()
            .input('bookid', id)
            .input('userid', req.user.userid)
            .input('title', title)
            .input('author', author)
            .input('genre', genre)
            .input('description', description)
            .query('UPDATE books SET title = @title, author = @author, genre = @genre, description = @description WHERE bookid = @bookid AND userid = @userid;');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Book not found or not authorized to update.' });
        }

        res.json({ message: 'Book updated successfully.' });
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).json({ error: 'Failed to update book.' });
    }
}

export const deleteBook = async (req, res) => {
    const { bookid } = req.params
    const pool = await connectDb();

    try {
        const result = await pool.request()
            .input('bookid', bookid)
            .input('userid', req.user.userid)
            .query('DELETE FROM books WHERE bookid = @bookid AND userid = @userid;');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Book not found or not authorized to delete.'});
        }

        res.json({ message: 'Book deleted successfully.' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book.' });
    }
}

export const getBooksByFIlter = async (req, res) => {
    
    const { title, author, genre } = req.query; // Query parameters for filtering
    const pool = await connectDb();

    try {
        // Base query for selecting all books
        let query = 'SELECT * FROM [books] WHERE 1=1;'
        
        if (title) {
            query += ' title LIKE @title;'
        }
        if (author) {
            query += ' AND author LIKE @author;'
        }
        if (genre) {
            query += ' AND genre LIKE @genre;'
        }

        const request = pool.request()
            .input('userid', req.user.userid);

        // Add parameters for filtering if provided
        if (title) {
            request.input('title', `%${title}%`);
        }
        if (author) {
            request.input('author', `%${author}%`);
        }
        if (genre) {
            request.input('genre', `%${genre}%`);
        }

        const result = await request.query(query);
        res.json(result.recordset); // Send the filtered or unfiltered books to the client
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books.' });
    }
}

export const addBookToUserCollection = async (req, res) => {
    const { bookid } = req.body
    const userid = res.locals.userid 
    if (!bookid) {
        return res.status(400).json({ error: 'Book ID is required' })
    }

    try {
        const pool = await connectDb()
        const request = pool.request()

        const bookExistsQuery = 'SELECT * FROM [books] WHERE bookid = @bookid';
        const bookCheck = await request.input('bookid', sql.Int, bookid).query(bookExistsQuery);

        if (bookCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const userBookExistsQuery = 'SELECT * FROM [user_books] WHERE userid = @userid AND bookid = @bookid'
        const userBookCheck = await request
            .input('userid', sql.Int, userid)
            .input('bookid', sql.Int, bookid)
            .query(userBookExistsQuery)

        if (userBookCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'Book is already in your collection' })
        }

        const insertQuery = 'INSERT INTO [user_books] (userid, bookid) VALUES (@userid, @bookid)';
        await request.query(insertQuery)

        res.status(200).json({ message: 'Book added to your collection successfully' })
    } catch (error) {
        console.error('Error adding book to collection:', error)
        res.status(500).json({ error: 'Failed to add book to your collection' })
    }
}
