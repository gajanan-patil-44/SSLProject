import express from "express"
import {login,manageLoginDetail} from "../../Controllers/Login/login.js"

const router =express.Router()

router.post("/login", login)
router.post("/logindetail", manageLoginDetail);

export default router