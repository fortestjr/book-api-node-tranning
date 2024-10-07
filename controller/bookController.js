import sql from 'mssql'
import connectDb from '../db/db.js'
import dotenv from 'dotenv'
dotenv.config()

export const createBook = async (req , res) => {
    const { title, author, genre, description } = req.body

    try {

        const pool = await connectDb()
        const request = new sql.Request(pool)

        request.input('userid', res.locals.userid)
        request.input('title', title)
        request.input('author', author)
        request.input('genre', genre)
        request.input('description', description)

        const insertedBook = 
        await request
        .query(
            `INSERT INTO books (userid, title, author, genre, description)
                OUTPUT INSERTED.bookid , INSERTED.title , INSERTED.author , INSERTED.genre
                VALUES (@userid, @title, @author, @genre, @description)`)

        res.status(201).json({ book : insertedBook.recordset[0] })
    } catch (error) {
        console.error('Error creating book:', error)
        res.status(500).json({ error: 'Failed to create book.' })
    }
}

export const getBookByUserId =  async (req, res) => {
    const pool = await connectDb()
    try {
        const request = new sql.Request(pool)
        request.input('userid', req.params.userid)
            .query('SELECT * FROM books WHERE userid = @userid;')
        res.json(result.recordset)
    } catch (error) {
        console.error('Error fetching books:', error)
        res.status(500).json({ error: 'Failed to fetch books.' })
    }
}

export const updateBook = async (req, res) => {
    const { bookid } = req.params
    const { title, author, genre, description } = req.body
    try {
        const pool = await connectDb()
        const request = new sql.Request(pool)

        let query = 'UPDATE books SET '
        const fields = []

        if (title) {
            fields.push('title = @title');
            request.input('title', sql.NVarChar, title);
        }
        if (author) {
            fields.push(' author = @author');
            request.input('author', sql.NVarChar, author);
        }
        if (genre) {
            fields.push(' genre = @genre');
            request.input('genre', sql.NVarChar, genre);
        }
        if (description) {
            fields.push(' description = @description');
            request.input('description', sql.NVarChar, description);
        }

        if (fields.length === 0) {
            return res.status(400).json({ message : "Bad Request" , error: 'No fields to update provided.' })
        }

        // This keyword specifies that the query should return some result
        query += fields.join(', ') + ' OUTPUT INSERTED.*  WHERE bookid = @bookid AND userid = @userid;'

        request.input('bookid', sql.Int, bookid)
            .input('userid', sql.Int, res.locals.userid)

        const updatedBook = await request.query(query)

        if (updatedBook.recordset[0] === 0) {
            return res.status(404).json({ error: 'Book not found or not authorized to update.' })
        }

        res.json({ 
            message: 'Book updated successfully.' ,
            Book : updatedBook
        })
    } catch (error) {
        console.error('Error updating book:', error)
        res.status(500).json({ error: 'Failed to update book.' })
    }
};


export const deleteBook = async (req , res) => {
    const { bookid } = req.params

    try {

        const pool = await connectDb()
        const request = new sql.Request(pool)
        request.input('bookid', sql.Int, bookid)
            .input('userid', sql.Int, res.locals.userid)

        const deleteBook = await request.query('DELETE FROM [books] OUTPUT DELETED.* WHERE bookid = @bookid AND userid = @userid;')

        if (deleteBook.rowsAffected[0] === 0) {
            return res.status(404).json({ error: 'Book not found or not authorized to delete.'})
        }

        res.json({ 
            message: 'Book deleted successfully.' ,
            deleteBook 
        })

    } catch (error) {
        console.error('Error deleting book:', error)
        res.status(500).json({ error: 'Failed to delete book.' })
    }
}

export const getBooksByFIlter = async (req, res) => {
    
    const { title, author, genre } = req.query
    const pool = await connectDb()
    const request = new sql.Request(pool)

    try {
        let query = 'SELECT * FROM [books] WHERE 1=1'
        
        if (title) {
            query += ' AND title LIKE @title'
            request.input('title', sql.NVarChar , `%${title}%`)

        }
        if (author) {
            query += ' AND author LIKE @author'
            request.input('author', sql.NVarChar , `%${author}%`)

        }
        if (genre) {
            query += ' AND genre LIKE @genre;'
            request.input('genre', sql.NVarChar , `%${genre}%`)

        }

        request.input('userid', sql.Int , res.locals.userid)

        const result = await request.query(query)
        res.json(result.recordset)
    } catch (error) {
        console.error('Error fetching books:', error)
        res.status(500).json({ error: 'Failed to fetch books.' })
    }
}

export const addBookToUserCollection = async (req, res) => {
    const { bookid } = req.params
    const userid = res.locals.userid 
    if (!bookid) {
        return res.status(400).json({ error: 'Book ID is required' })
    }

    try {
        const pool = await connectDb()
        const request = new sql.Request(pool)

        const bookExistsQuery = 'SELECT * FROM [books] WHERE bookid = @bookid';
        const bookCheck = await request.input('bookid', sql.Int, bookid).query(bookExistsQuery);

        if (bookCheck.recordset.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        const userBookExistsQuery = 'SELECT * FROM [user_books] WHERE userid = @userid AND bookid = @bookid'
        const userBookCheck = await request
            .input('userid', sql.Int, userid)
            .query(userBookExistsQuery)

        if (userBookCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'Book is already in your collection' })
        }

        const insertQuery = 'INSERT INTO [user_books] (userid, bookid) OUTPUT INSERTED.* VALUES (@userid, @bookid);'
        const insertedBook = await request.query(insertQuery)

        res.status(200).json({ 
            message: 'Book added to your collection successfully' ,
            insertedBook
        })
    } catch (error) {
        console.error('Error adding book to collection:', error)
        res.status(500).json({ error: 'Failed to add book to your collection' })
    }
}
