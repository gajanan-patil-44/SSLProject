import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log("Connected to PostgreSQL database successfully!");
        client.release();
    } catch (err) {
        console.error("Error connecting to PostgreSQL database:", err.message);
        process.exit(1);
    }
};

export { pool, connectDB };