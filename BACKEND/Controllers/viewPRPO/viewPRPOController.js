
import {getAllPRPOHeaders, getPRPODetailsById} from "../../Models/viewPRPO/viewPRPOModel.js";


export const getPRPOHeaders = async (req, res) => {

    const { flagId } = req.body;

    try {

        // FLAG ID VALIDATION

        if (flagId === undefined || flagId === null || flagId === "") {

            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }


        if (!Number.isInteger(Number(flagId))) {

            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }


        // flagId 1 = Get PRPO Headers Based on Logged-in UserId

        if (parseInt(flagId) === 1) {

            // GET USER ID FROM AUTHENTICATED TOKEN

            const UserId = req.user?.UserId;

            if (!UserId) {

                return res.status(401).json({
                    status: "error",
                    message: "UserId not found in authentication token"
                });
            }


            const rows = await getAllPRPOHeaders(UserId);

            return res.status(200).json({
                status: "success",
                message: "PRPO Headers fetched successfully",
                data: rows
            });
        }


        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch PRPO Headers",
            error: error.message
        });
    }
};



// GET COMPLETE PRPO DETAILS

export const getPRPODetails = async (req, res) => {

    const { flagId, PRPOHeaderId } = req.body;

    try {

        // FLAG ID VALIDATION

        if (flagId === undefined || flagId === null || flagId === "") {

            return res.status(400).json({
                status: "error",
                message: "flagId is required"
            });
        }

        if (!Number.isInteger(Number(flagId))) {

            return res.status(400).json({
                status: "error",
                message: "flagId must be a valid number"
            });
        }

        // FLAG ID 1 = GET COMPLETE PRPO DETAILS

        if (parseInt(flagId) === 1) {

            // PRPO HEADER ID VALIDATION

            if (
                PRPOHeaderId === undefined ||
                PRPOHeaderId === null ||
                !/^[1-9]\d*$/.test(String(PRPOHeaderId))
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Valid PRPOHeaderId is required"
                });
            }

            // FETCH PRPO DETAILS

            const data = await getPRPODetailsById(PRPOHeaderId);

            if (!data) {

                return res.status(404).json({
                    status: "error",
                    message: "PRPO details not found"
                });
            }

            return res.status(200).json({
                status: "success",
                message: "PRPO details fetched successfully",
                data: data
            });
        }

        // INVALID FLAG ID

        return res.status(400).json({
            status: "error",
            message: "Invalid flagId"
        });

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Failed to fetch PRPO details",
            error: error.message
        });
    }
};