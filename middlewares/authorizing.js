
import sql from 'mssql'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import connectDb from '../db/db.js'
import Message from 'tedious/lib/message.js'

dotenv.config()

const authorize = async (req , res , next) => {
    try {
        const pool = await connectDb()
        const request = new sql.Request(pool)
        const token = req.headers['x-auth']

        if (!token) {
            return res.status(401).send('No token provided')
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        const { userid, handle, email , role } = decodedPayload

        const selectQuery = `SELECT * FROM [users] WHERE handle = @handle AND email = @email;`
        request.input('handle', sql.NVarChar, handle)
        request.input('email', sql.NVarChar, email)

        const selectedUSer = await request.query(selectQuery)

        if (selectedUSer.recordset.length === 0) {
            return res.status(400).send('User does not exist. You need to sign up')
        }

        res.locals.userid = userid
        
        if (role === 'admin'){
            next()
            return 
        }
        res.status(401).json({Message : "You Are Not Authorized"})
    } catch (error) {
        console.error('Authentication error:', error)
        res.status(500).send('Server error')
    }
}

export default authorize