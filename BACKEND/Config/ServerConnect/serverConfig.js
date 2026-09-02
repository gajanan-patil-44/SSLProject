import { connectDB } from "../../Config/db.js"
import dotenv from "dotenv"
dotenv.config()


const Port = process.env.PORT;
const startServer = async (app) => {
    try {
        await connectDB();
        app.listen(Port, () => {
            console.log(`Server running on port ${Port}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
};



export default startServer