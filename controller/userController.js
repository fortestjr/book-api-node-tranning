import sql from 'mssql'
import connectDb from '../db/db.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
dotenv.config()


export const register = async(req , res)=>{
    const {username , pass , email , handle} = req.body

    if(!pass || !email || !handle){
        return res.status(400).send("All Fields Are Required")
    }
    const pool = await connectDb()
    const request = new sql.Request(pool)
    const selectQuery = `select * from [users] where handle = @selectedhandle`
    request.input('selectedhandle' , sql.NVarChar , handle)
    const user = await request.query(selectQuery)
    console.log(user.recordset);

    if(user.recordset.length !=0){
        return res.status(400).send("User Already Exist")
    }

    const salt = await bcrypt.genSalt(10)
    const hashedPass = await bcrypt.hash(pass ,salt)
    
    const insertQuery = `insert into [users] (username , password , email , handle)
                        output inserted.email , inserted.handle , inserted.username, inserted.userid 
                        values(@username , @password , @email , @handle)`
    request.input('username' , sql.NVarChar , username)
    request.input('password' , sql.NVarChar , hashedPass)
    request.input('email' , sql.NVarChar , email)
    request.input('handle' , sql.NVarChar , handle)
    const insertedUser = await request.query(insertQuery)

    res.status(201).json({
        message: "User Registered Successfully",
        user : insertedUser
    })
}


export const logIn = async (req, res) => {
    const { login , pass } = req.body

    if (!login || !pass) {
        return res.status(400).json({ error: "Login and password are required" });
    }

    try {
        const pool = await connectDb()
        const request = new sql.Request(pool)  

        
        const selectQuery = `SELECT * FROM [users] WHERE (handle = @login OR email = @login);`
        
        // Set the input parameters for the query
        request.input('login', sql.NVarChar, login)

        const selectedUser = await request.query(selectQuery)
        console.log(selectedUser)

        if (selectedUser.recordset.length === 0) {
            return res.status(401).send("Invalid login credentials")
        }

        const user = selectedUser.recordset[0]
        const hashedPass = user.password

        const isPassValid = await bcrypt.compare(pass, hashedPass)

        if (!isPassValid) {
            return res.status(401).send("Invalid login credentials (wrong password)")
        }

        const payload = {
            userid: user.userid,
            handle: user.handle,
            email: user.email,
            role: user.role,
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' })

        return res.status(200).json({
            message: "Login successful",
            token, 
            user: { userid: user.userid, handle: user.handle, email: user.email, role: user.role } 
        })

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: "An error occurred during login" })
    }
}

export const getMyBooks =  async (req, res) => {
    const { title, author, genre } = req.query 
    const pool = await connectDb()

    try {
        let query = 'SELECT * FROM books WHERE userid = @userid;'
        
        if (title) {
            query += ' AND title LIKE @title;'
        }
        if (author) {
            query += ' AND author LIKE @author;'
        }
        if (genre) {
            query += ' AND genre LIKE @genre;'
        }

        const request = pool.request().input('userid', req.user.userid)

        if (title) {
            request.input('title', `%${title}%`)
        }
        if (author) {
            request.input('author', `%${author}%`)
        }
        if (genre) {
            request.input('genre', `%${genre}%`)
        }

        const result = await request.query(query)
        res.json(result.recordset) 
    } catch (error) {
        console.error('Error fetching books:', error)
        res.status(500).json({ error: 'Failed to fetch books.' })
    }
}