import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import "dotenv/config";
import applyRoutes from "./Helpers/appRoutes.js";
import startServer from "./Config/ServerConnect/serverConfig.js";
import startBirthdayJob from "./Jobs/birthdayJobs.js";


const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
    res.send("The Server is Running.!");
});

applyRoutes(app);
startBirthdayJob();
startServer(app);