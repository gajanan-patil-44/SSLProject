import { connectDB } from "../../Config/db.js"
import dotenv from "dotenv"
dotenv.config()


const Port = process.env.PORT

const startServer = async (app) => {
    try {
        await connectDB();
        app.listen(Port, () => {
            console.log("Server is running on port 9004");
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};



export default startServer