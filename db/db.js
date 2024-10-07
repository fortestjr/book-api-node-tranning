import sqlConfig from "../server/config.js";
import sql from "mssql";

let pool ;

export const connectDb = async()=>{
    // Connect to the database
        try {

            if(!pool){
                pool = await sql.connect(sqlConfig); // Create the connection pool using the configuration
                return pool
            }
        } catch (error) {
            console.error('Database connection error:', error)
            throw error
        }
}

export default connectDb