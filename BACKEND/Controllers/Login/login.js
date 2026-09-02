import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

import {
    findUserForLogin,
    updateFailedLogin,
    setTempBlock,
    clearTempBlock,
    resetAttempts,
    setPermanentBlock
} from "../../Models/LoginModel.js";


// ==========================================================
// LOGIN
// ==========================================================

export const login = async (req, res) => {

    try {

        const { username, password } = req.body || {};


        // ======================================================
        // VALIDATION
        // ======================================================

        if (
            username === undefined ||
            username === null ||
            String(username).trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Username is required"
            });

        }


        if (
            password === undefined ||
            password === null ||
            String(password).trim() === ""
        ) {

            return res.status(400).json({
                success: false,
                message: "Password is required"
            });

        }


        // ======================================================
        // FIND USER
        // ======================================================

        const loginData = await findUserForLogin(String(username).trim());


        if (
            !loginData ||
            !loginData.user
        ) {

            return res.status(401).json({
                success: false,
                message:
                    "Invalid username, email, or phone number"
            });

        }


        const user = loginData.user;


        // ======================================================
        // ACCOUNT STATUS
        // ======================================================

        if (
            user.IsDisabled === true ||
            user.IsBlocked === true
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Your account has been blocked or disabled"
            });

        }


        // ======================================================
        // TEMPORARY BLOCK
        // ======================================================

        if (
            user.IsTempBlocked === true &&
            user.TempBlockedOn
        ) {

            const blockedTime =
                new Date(
                    user.TempBlockedOn
                ).getTime();

            const difference =
                Date.now() - blockedTime;

            const twoMinutes =
                2 * 60 * 1000;


            if (
                difference < twoMinutes
            ) {

                const remainingSeconds =
                    Math.ceil(
                        (twoMinutes - difference) / 1000
                    );

                return res.status(429).json({

                    success: false,

                    message:
                        `Account temporarily locked. Try again after ${remainingSeconds} seconds.`

                });

            }


            await clearTempBlock(
                user.UserId
            );

        }


        // ======================================================
        // PASSWORD
        // ======================================================

        const passwordMatch = await bcrypt.compare(String(password), user.Password);


        if (!passwordMatch) {

            const attemptCount =
                await updateFailedLogin(
                    user.UserId
                );


            if (attemptCount >= 5) {

                await setPermanentBlock(
                    user.UserId
                );

                return res.status(403).json({

                    success: false,

                    message:
                        "Your account has been permanently blocked because of too many failed login attempts."

                });

            }


            if (attemptCount === 3) {

                await setTempBlock(
                    user.UserId
                );

                return res.status(429).json({

                    success: false,

                    message:
                        "Account temporarily locked. Try again in 2 minutes."

                });

            }


            if (attemptCount === 4) {

                return res.status(401).json({

                    success: false,

                    message:
                        "Invalid password. You have 1 attempt left before your account is permanently blocked."

                });

            }


            return res.status(401).json({

                success: false,

                message:
                    "Invalid password."

            });

        }


        // ======================================================
        // PASSWORD CORRECT
        // ======================================================

        await resetAttempts(
            user.UserId
        );


        // ======================================================
        // JWT
        // ======================================================

        const token =
            jwt.sign(

                {
                    UserId:
                        user.UserId,

                    LoginName:
                        user.LoginName,

                    Email:
                        user.Email,

                    DesignationId:
                        user.DesignationId
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "12h"
                }
            );


        // ======================================================
        // USER RESPONSE
        // ======================================================

        const userResponse = {

            UserId: user.UserId,
            loginName: user.LoginName,

            name: {
                first:
                    user.FirstName,
                middle:
                    user.MiddleName,
                last:
                    user.LastName
            },
            email: user.Email,
            phone: user.PhoneNumber,
            photo: {

                url:
                    `/api/users/${user.UserId}/photo`

            },

            designation: {

                id:
                    user.CompanyDesignationId,

                code:
                    user.DesignationCode,

                name:
                    user.DesignationName

            }

        };


        // ======================================================
        // RAW DATA
        // ======================================================

        const companies = loginData.companies || [];
        const products = loginData.products || [];
        const projects = loginData.projects || [];

        const roles = loginData.roles || [];

        const reportingManagers =loginData.reportingManager || [];


        // ======================================================
        // COMPANY CONTEXT
        // ======================================================

        const companyContext =
            companies.map(
                company => {

                    const companyProducts =
                        products
                            .filter(
                                product =>
                                    Number(
                                        product.CompanyId
                                    ) ===
                                    Number(
                                        company.CompanyId
                                    )
                            )
                            .map(
                                product => {

                                    const productProjects =
                                        projects
                                            .filter(
                                                project =>
                                                    Number(
                                                        project.CompanyProductId
                                                    ) ===
                                                    Number(
                                                        product.CompanyProductId
                                                    )
                                            )
                                            .map(
                                                (project, index) => ({

                                                    id:
                                                        project.ProjectId,

                                                    code:
                                                        project.ProjectCode,

                                                    name:
                                                        project.ProjectName,

                                                    primary:
                                                        index === 0

                                                })
                                            );


                                    return {

                                        id:
                                            product.ProductId,

                                        code:
                                            product.ProductCode,

                                        name:
                                            product.ProductName,

                                        projects:
                                            productProjects

                                    };

                                }
                            );


                    const companyRoles =
                        roles.map(
                            role => ({

                                id:
                                    role.RoleId,

                                code:
                                    role.RoleCode,

                                name:
                                    role.RoleName

                            })
                        );


                    return {

                        id:
                            company.CompanyId,

                        code:
                            company.CompanyCode,

                        name:
                            company.CompanyName,

                        products:
                            companyProducts,

                        roles:
                            companyRoles

                    };

                }
            );


        // ======================================================
        // REPORTING MANAGER
        // ======================================================

        let reportingManager = null;


        if (
            reportingManagers.length > 0
        ) {

            const manager =
                reportingManagers[0];


            reportingManager = {

                userId:
                    manager.ReportingManagerUserId,

                name:
                    manager.ReportingManagerName

            };

        }


        // ======================================================
        // SESSION
        // ======================================================

        const loginAt =
            new Date();

        const expiresAt =
            new Date(
                loginAt.getTime() +
                12 * 60 * 60 * 1000
            );

        const sessionId =
            randomUUID();


        // ======================================================
        // FINAL RESPONSE
        // ======================================================

        return res.status(200).json({

            success: true,

            message:
                "Login successful",

            data: {

                user:
                    userResponse,

                context: {

                    companies:
                        companyContext

                },

                reporting: {

                    manager:
                        reportingManager

                }

            },

            session: {

                id:
                    sessionId,

                loginAt:
                    loginAt.toISOString(),

                expiresAt:
                    expiresAt.toISOString()

            },

            token: {

                accessToken:
                    token

            }

        });

    }


    catch (error) {

        console.error(
            "Login Error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal Server Error",

            error:
                error.message

        });

    }

};


export default login;