import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import {findUserForLogin,updateFailedLogin,setTempBlock,clearTempBlock,resetAttempts,setPermanentBlock} from "../../Models/LoginModel.js"

const buildMenuPage = (pages) => {const pageMap = new Map();
    const menuPage = [];
    // ==========================================================
    // CREATE PAGE MAP
    // ==========================================================

    for (const page of pages) {
        pageMap.set(Number(page.PageId),
            {
                PageId:page.PageId,
                PageName:page.PageName,
                PageUrl:page.PageUrl,
                PageIcon:page.PageIcon,
                ParentPageId:page.ParentPageId === null || page.ParentPageId === undefined ? null : Number(page.ParentPageId),
                OrderNo: Number(page.OrderNo),
                children: []
            }
        );
    }
    // ==========================================================
    // CREATE PARENT / CHILD RELATION
    // ==========================================================
    for (const page of pageMap.values()) {
        if (
            page.ParentPageId === null ||
            page.ParentPageId === undefined
        ) {
            menuPage.push(page);
            continue;
        }


        const parent = pageMap.get(Number(page.ParentPageId));
        if (parent) {
            parent.children.push(page);
        }
    }
    // ==========================================================
    // SORT MENU
    // ==========================================================
    const sortPages = (pageList) => {
        pageList.sort((a, b) => {
                const orderDifference = Number(a.OrderNo) - Number(b.OrderNo);
                if (orderDifference !== 0)
                     {
                    return orderDifference;
                }
                return (Number(a.PageId) - Number(b.PageId));
            }
        );
        for (const page of pageList) {
            if (Array.isArray(page.children) && page.children.length > 0)
                 {
                sortPages(page.children);
            }
        }
        return pageList;
    };
    return sortPages(menuPage);
};
// ==========================================================
// LOGIN
// ==========================================================
export const login = async (req, res) => {
    try {
        const {username,password} = req.body;
        if (!username || !password)
             {
            return res.status(400).json({
                success: false,
                message:"Username and password are required"
            });
        }
        // ==========================================================
        // FIND USER
        // ==========================================================
        const result =await findUserForLogin(username);
        if (!result) {
            return res.status(401).json({
                success: false,
                message:"Invalid username or password"
            });
        }
        const user =result.user;
        // ==========================================================
        // CHECK PERMANENT BLOCK
        // ==========================================================
        if (user.IsBlocked === true)
             {
            return res.status(403).json({
                success: false,
                message:"User account is permanently blocked"
            });
        }
        // =========================================================
        // CHECK TEMPORARY BLOCK
        // ==========================================================
        if (user.IsTempBlocked === true && user.TempBlockedOn) 
            {
            const blockedTime = new Date(user.TempBlockedOn).getTime();
            const currentTime = Date.now();
            const difference = currentTime - blockedTime;
            const blockDuration = 2 * 60 * 1000;

            if (difference < blockDuration) 
                {
                const remainingSeconds = Math.ceil((blockDuration - difference) / 1000);

                return res.status(403).json({
                    success: false,
                    message:`Account temporarily blocked. Try again after ${remainingSeconds} seconds`
                });
            }
            await clearTempBlock(user.UserId);
        }
        // ==========================================================
        // CHECK PASSWORD
        // ==========================================================
        const passwordMatch = await bcrypt.compare(password,user.Password);
        if (!passwordMatch) {
            const attemptCount =await updateFailedLogin(user.UserId);
            // ==========================================================
            // 3 FAILED ATTEMPTS
            // TEMPORARY BLOCK
            // ==========================================================
            if (attemptCount >= 3 && attemptCount < 5)
                 {
                await setTempBlock(user.UserId);
                return res.status(403).json({
                    success: false,
                    message:"Too many failed attempts. Account temporarily blocked for 2 minutes"
                });
            }
            // ==========================================================
            // 5 FAILED ATTEMPTS
            // PERMANENT BLOCK
            // ==========================================================
            if (attemptCount >= 5)
                 {
                await setPermanentBlock(user.UserId);
                return res.status(403).json({
                    success: false,
                    message:"Account permanently blocked due to multiple failed login attempts"
                });
            }
            return res.status(401).json({
                success: false,
                message:"Invalid username or password",
                attemptsRemaining: 3 - attemptCount
            });
        }
        // ==========================================================
        // SUCCESSFUL LOGIN
        // RESET ATTEMPTS
        // ==========================================================
        await resetAttempts( user.UserId);
        // ==========================================================
        // JWT TOKEN
        // ==========================================================
        const token = jwt.sign(
            {
                UserId:user.UserId,
                EmployeeId:user.EmployeeId,
                LoginName:user.LoginName,
                Email:user.Email,
                DesignationId:user.DesignationId
            },
            process.env.JWT_SECRET,
            {
                expiresIn:
                    process.env.JWT_EXPIRES_IN ||
                    "12h"
            }
        );
        // ==========================================================
        // SESSION
        // ==========================================================
        const sessionId = crypto.randomUUID();
        const loginAt = new Date();
        const expiresAt = new Date(loginAt.getTime() + 12 * 60 * 60 * 1000);

        // ==========================================================
        // MENU PAGE
        // ==========================================================
        const menuPage = buildMenuPage(result.menuPage || []);
        // ==========================================================
        // PHOTO BASE64
        // ==========================================================
        let photo = null;
        if (user.Photo) {
            if (Buffer.isBuffer(user.Photo))
                 {
                photo = user.Photo.toString("base64");
            } else if (
                user.Photo instanceof Uint8Array
            ) {
                photo = Buffer.from(user.Photo).toString("base64");
            } else if (
                typeof user.Photo === "string"
            ) {
                photo = user.Photo;
            }
        }
        // ==========================================================
        // FINAL RESPONSE
        // ==========================================================
        return res.status(200).json({
            success: true,
            message:"Login successful",
            token: {
                accessToken:token
            },
            data: {
                user: {
                    UserId:user.UserId,
                    loginName:user.LoginName,
                    name: {
                        first:user.FirstName,
                        middle:user.MiddleName,
                        last:user.LastName
                    },
                    email:user.Email,
                    phone:user.PhoneNumber,
                    designation: {
                        id:user.DesignationId,
                        name:user.DesignationName,
                        level:user.DesignationLevel
                    }
                },
              

                context: {
                    companies: result.companies,
                    products:result.products,
                    projects:result.projects,
                    roles:result.roles
                },
                
                reporting: {
                    manager:
                        result.reportingManager &&
                        result.reportingManager.length > 0
                            ? result.reportingManager[0]
                            : null
                },
           
                menuPage:
                    menuPage
            },

            session: {
                id:sessionId,
                loginAt:loginAt.toISOString(),
                expiresAt:expiresAt.toISOString()
            },
    
            photo:photo
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message:"Internal server error"
        });
    }
};