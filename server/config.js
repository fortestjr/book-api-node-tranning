import dotenv from "dotenv"
dotenv.config() 


const sqlConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT, 10), // Ensure port is an integer
    timeout: 60000,
    pool: {
        max: 10,
        min: 0,
    },
    options: {
        encrypt: false, // Set to true if encryption is required
        trustServerCertificate: true // Bypass certificate validation
    },
    requestTimeout: 60000 // Set timeout to 60 seconds
};
export default sqlConfig