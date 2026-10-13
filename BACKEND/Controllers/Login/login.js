import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { readFile } from "fs/promises";

import { findUserForLogin, updateFailedLogin, setTempBlock, clearTempBlock, resetAttempts, setPermanentBlock, logoutUserLoginDetail, createUserLoginDetail } from "../../Models/LoginModel.js"

const buildMenuPage = (pages) => {
    const pageMap = new Map();
    const menuPage = [];
    // ==========================================================
    // CREATE PAGE MAP
    // ==========================================================

    for (const page of pages) {
        pageMap.set(Number(page.PageId),
            {
                PageId: page.PageId,
                PageName: page.PageName,
                PageUrl: page.PageUrl,
                PageIcon: page.PageIcon,
                ParentPageId: page.ParentPageId === null || page.ParentPageId === undefined ? null : Number(page.ParentPageId),
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
            if (orderDifference !== 0) {
                return orderDifference;
            }
            return (Number(a.PageId) - Number(b.PageId));
        }
        );
        for (const page of pageList) {
            if (Array.isArray(page.children) && page.children.length > 0) {
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

        // ==========================================================
        // REQUEST
        // ==========================================================
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }
        // ==========================================================
        // FIND USER
        // ==========================================================
        const result = await findUserForLogin(username);

        if (!result || !result.user) {
            return res.status(401).json({
                success: false,
                message: "Invalid username or password"
            });
        }
        const user = result.user;
        // ==========================================================
        // CHECK PERMANENT BLOCK
        // ==========================================================
        if (user.IsBlocked === true) {
            return res.status(403).json({
                success: false,
                message: "User account is permanently blocked"
            });
        }
        // ==========================================================
        // CHECK TEMPORARY BLOCK
        // ==========================================================
        if (user.IsTempBlocked === true && user.TempBlockedOn) {
            const blockedTime = new Date(user.TempBlockedOn).getTime();
            const currentTime = Date.now();
            const difference = currentTime - blockedTime;
            const blockDuration = 2 * 60 * 1000;

            if (difference < blockDuration) {
                const remainingSeconds = Math.ceil((blockDuration - difference) / 1000);
                return res.status(403).json({
                    success: false,
                    message: `Account temporarily blocked. Try again after ${remainingSeconds} seconds`
                });
            }


            // Temporary block expired
            await clearTempBlock(user.UserId);
        }
        // ==========================================================
        // CHECK PASSWORD
        // ==========================================================
        const passwordMatch = await bcrypt.compare(password, user.Password);

        if (!passwordMatch) {
            const attemptCount = await updateFailedLogin(user.UserId);
            // =====================================================
            // TEMPORARY BLOCK
            // ======================================================
            if (attemptCount >= 3 && attemptCount < 5) {
                await setTempBlock(user.UserId);
                return res.status(403).json({
                    success: false,
                    message: "Too many failed attempts. Account temporarily blocked for 2 minutes"
                });
            }
            // ======================================================
            // PERMANENT BLOCK
            // ======================================================
            if (attemptCount >= 5) {
                await setPermanentBlock(user.UserId);
                return res.status(403).json({
                    success: false,
                    message: "Account permanently blocked due to multiple failed login attempts"
                });
            }
            return res.status(401).json({
                success: false,
                message: "Invalid username or password",
                attemptsRemaining: Math.max(0, 3 - attemptCount)
            });
        }
        // ==========================================================
        // SUCCESSFUL LOGIN
        // ==========================================================
        await resetAttempts(user.UserId);
        // ==========================================================
        // JWT TOKEN
        // ==========================================================
        const token = jwt.sign(
            {
                UserId: user.UserId,
                EmployeeId: user.EmployeeId,
                LoginName: user.LoginName,
                Email: user.Email,
                DesignationId: user.DesignationId
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "12h"
            }
        );
        // ==========================================================
        // MENU PAGE
        // ==========================================================
        const menuPage = buildMenuPage(result.menuPage || []);
        // ==========================================================
        // PHOTO BASE64
        // ==========================================================
        let photo = null;

if (user.Photo) {
    try {
        if (Buffer.isBuffer(user.Photo)) {
            photo = user.Photo.toString("base64");
        } else if (user.Photo instanceof Uint8Array) {
            photo = Buffer.from(user.Photo).toString("base64");
        } else if (typeof user.Photo === "string") {
            const photoBuffer = await readFile(user.Photo);
            photo = photoBuffer.toString("base64");
        }
    } catch (error) {
        console.error("Photo conversion error:", error.message);
        photo = null;
    }
}
        // ==========================================================
        // FINAL RESPONSE
        // ==========================================================
        return res.status(200).json({
            success: true,
            message: "Login successful",
            token: {
                accessToken: token
            },
            data: {
                user: {
                    UserId: user.UserId,
                    loginName: user.LoginName,
                    name: {
                        first: user.FirstName,
                        middle: user.MiddleName,
                        last: user.LastName
                    },
                    email: user.Email,
                    phone: user.PhoneNumber,

                    designation: {
                        id: user.DesignationId,
                        name: user.DesignationName,
                        level: user.DesignationLevel
                    }
                },
                context: {
                    companies: result.companies || [],
                    products: result.products || [],
                    projects: result.projects || [],
                    roles: result.roles || []
                },
                reporting: {
                    manager: result.reportingManager && result.reportingManager.length > 0 ? result.reportingManager[0] : null
                },
                menuPage: menuPage
            },
            photo: photo
        });

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
// ==========================================================
// MANAGE USER LOGIN DETAIL
// FlagId 1 = LOGIN
// FlagId 2 = LOGOUT
// ==========================================================

export const manageLoginDetail = async (req, res) => {
    try {
        const {
            FlagId, UserLoginDetailId, UserId, PublicIPAddress, HostName, SystemName, OperatingSystem, OSVersion,
            BrowserName, BrowserVersion, UserAgent, DeviceType, DeviceName, Latitude, Longitude, LocationAccuracy, NetworkType, LogoutReason,
            ApplicationName,
            ApplicationVersion
        } = req.body;



        if (!FlagId) {
            return res.status(400).json({
                success: false,
                message: "FlagId is required"
            });
        }
        // ==========================================================
        // LOGIN
        // FlagId = 1
        // ==========================================================
        if (FlagId === 1) {
            if (!UserId) {
                return res.status(400).json({
                    success: false,
                    message: "UserId is required for login"
                });
            }

            const loginDetail =
                await createUserLoginDetail({
                    UserId: UserId,
                    IPAddress: req.ip,
                    PublicIPAddress: PublicIPAddress || null,
                    HostName: HostName || null,
                    SystemName: SystemName || null,
                    OperatingSystem: OperatingSystem || null,
                    OSVersion: OSVersion || null,
                    BrowserName: BrowserName || null,
                    BrowserVersion: BrowserVersion || null,
                    UserAgent: UserAgent || req.get("User-Agent") || null,
                    DeviceType: DeviceType || null,
                    DeviceName: DeviceName || null,
                    Latitude: Latitude || null,
                    Longitude: Longitude || null,
                    LocationAccuracy: LocationAccuracy || null,
                    NetworkType: NetworkType || null,
                    ApplicationName: ApplicationName || null,
                    ApplicationVersion: ApplicationVersion || null
                });


            return res.status(201).json({
                success: true,
                message: "User login detail created successfully",
                data: {
                    UserLoginDetailId: loginDetail.UserLoginDetailId,
                    UserId: loginDetail.UserId,
                    LoginAt: loginDetail.LoginAt
                }
            });
        }


        // ==========================================================
        // LOGOUT
        // FlagId = 2
        // ==========================================================

        if (FlagId === 2) {
            if (!UserLoginDetailId) {
                return res.status(400).json({
                    success: false,
                    message: "UserLoginDetailId is required for logout"
                });
            }

            const logoutDetail = await logoutUserLoginDetail(UserLoginDetailId, LogoutReason);

            if (!logoutDetail) {
                return res.status(404).json({
                    success: false,
                    message: "Active login session not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Logout successful",
                data: {
                    UserLoginDetailId: logoutDetail.UserLoginDetailId,
                    UserId: logoutDetail.UserId,
                    LoginAt: logoutDetail.LoginAt,
                    LogoutAt: logoutDetail.LogoutAt,
                    IsActive: logoutDetail.IsActive,
                    LogoutReason: logoutDetail.LogoutReason
                }
            });
        }
        // ==========================================================
        // INVALID FLAG
        // ==========================================================
        return res.status(400).json({
            success: false,
            message: "Invalid FlagId"
        });

    } catch (error) {

        console.error(
            "Manage Login Detail Error:",
            error
        );
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};