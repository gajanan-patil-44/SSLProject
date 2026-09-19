import { getAllUserDetails,editUserdetails } from "../../Models/userEditDetails/UserEdit.js";
export const getAllUserDetailsController = async (req, res) => {
    const { flagId } = req.body
    try {
        if (Number(flagId) !== 1) {
            return res.status(400).json({ status: false, message: "Please Enter Valid FlagId" })
        }
        const result = await getAllUserDetails();
        return res.status(200).json({
            status: true,
            message: "UserDetails Fetched Successfully",
            data: result
        })
    } catch (error) {
        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        })
    }
}

export const editUserdetailsController     = async (req, res) => {

    const {
        UserId,
        flagId,
        employeeId,
        firstName,
        middleName,
        lastName,
        phoneNumber,
        dateOfBirth,
        genderId,
        maritalStatusId,
        designationId,
        email,
        loginName,
        altPhoneNumber,
        dateOfJoining,
        updatedByUserName
    } = req.body;

    try {


        if (Number(flagId) !== 2) {

            return res.status(400).json({
                status: false,
                message: "Please Enter Valid FlagId"
            });

        }


        if (!UserId) {

            return res.status(400).json({
                status: false,
                message: "UserId is required"
            });

        }

        const result = await editUserdetails({

            UserId,

            employeeId,
            firstName,
            middleName,
            lastName,
            phoneNumber,
            dateOfBirth,
            genderId,
            maritalStatusId,
            designationId,
            email,
            loginName,
            altPhoneNumber,
            dateOfJoining,
            updatedByUserName

        });


        if (!result) {

            return res.status(404).json({
                status: false,
                message: "User not found"
            });

        }

        return res.status(200).json({
            status: true,
            message: "User Details Updated Successfully",
            data: result
        });

    } catch (error) {

        console.error("Edit User Details Error:", error);

        return res.status(500).json({
            status: false,
            message: "Internal Server Error",
            error: error.message
        });

    }
};

