import sql from 'mssql'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import connectDb from '../db/db.js'

dotenv.config()

const authenticate = async (req , res , next) => {
    try {
        const pool = await connectDb()
        const request = new sql.Request(pool)
        const token = req.headers['x-auth']

        if (!token) {
            return res.status(401).send('No token provided')
        }

        const decodedPayload = jwt.verify(token, process.env.JWT_SECRET)
        const { userid, handle, email } = decodedPayload

        const selectQuery = `SELECT * FROM [users] WHERE handle = @handle AND email = @email;`
        request.input('handle', sql.NVarChar, handle)
        request.input('email', sql.NVarChar, email)

        const selectedUSer = await request.query(selectQuery)

        if (selectedUSer.recordset.length === 0) {
            return res.status(400).send('User does not exist. You need to sign up')
        }

        res.locals.userid = userid
        next()
    } catch (error) {
        console.error('Authentication error:', error)
        res.status(500).send('Server error')
    }
};

export default authenticate
