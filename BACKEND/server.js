import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import applyRoutes from "./Helpers/appRoutes.js";
import startServer from "./Config/ServerConnect/serverConfig.js";



const app = express();

app.use(bodyParser.json());

const allowedOrigins = [

    "http://localhost:5173",
    "http://localhost:5175",
    "http://192.168.23.67:5175",
    "http://192.168.23.51:5175",
    "http://192.168.23.99:5175",
    "http://192.168.23.83:5175",
    "http://192.168.23.78:5175",
    "http://192.168.23.52:5173",
    "http://192.168.23.57:5173",


];
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.get("/", (req, res) => {
    res.send("The Server is Running.!");
});

applyRoutes(app);
startServer(app);