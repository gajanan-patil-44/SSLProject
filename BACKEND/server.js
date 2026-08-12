import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./Config/db.js";


const app = express();


app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {

    res.send("Hello World!");
});

const startServer = async () => {
     try {
        await connectDB();
        app.listen(3000, () => {
            console.log("Server is running on port 3000");
        });

    } catch (error) {

        console.error("Failed to start server:",error.message);
        process.exit(1);
    }
};


startServer();