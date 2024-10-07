import express from "express"
import sql from "mssql"
import { fileURLToPath } from "url"
import path from 'path';
import fs from 'fs/promises'; // Use 'fs/promises' for promise-based fs methods
import connectDb from "../db/db.js";

import userRoutes from '../routes/user.js'
import bookRoutes from '../routes/book.js'

console.log('DB_SERVER: ', process.env.DB_SERVER);
console.log('DB_PORT: ', process.env.DB_PORT);
// console.log('enviromentT:', process.env);

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// console.log(__dirname)
const migrationFile = path.join(__dirname , '../migrations' , '001-initial.sql')
console.log(migrationFile);


(async () => {
    try {

        const pool = await connectDb()
        console.log('Connected to SQL Server and database.');
        
        // Read and execute migration script
        const request = new sql.Request(pool)
        const sqlQueries = await fs.readFile(migrationFile, 'utf-8');
        await request.query(sqlQueries);        
        console.log('Migration script executed successfully.');

        // console.dir(result);
        // console.log(result);
        
    } catch (err) {
        console.error('Error executing migration script:', err);
        process.exit(1); // Exit the process with a non-zero status code
    }
})();




const app = express()
const PORT = process.env.PORT || 8000
app.use(express.json())

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }))

/*This is the default format for form submissions. For this,
you use the express.urlencoded middleware to parse the form data*/

app.use('/api/user', userRoutes)
app.use('/api/book', bookRoutes)

// Middleware to parse URL-encoded bodies

app.listen(PORT , ()=> {console.log("welcome")})
