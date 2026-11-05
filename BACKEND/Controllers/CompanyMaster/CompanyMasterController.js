
import {
    getAllCompanyMasters,
    addCompanyMaster as addCompanyMasterModel,
    checkCompanyMasterExists,
    checkCompanyMasterContactExists,
    checkCompanyMasterEmailExists,
    checkCompanyMasterExistsForUpdate,
    checkCompanyMasterContactExistsForUpdate,
    checkCompanyMasterEmailExistsForUpdate,
    updateCompanyMasters,
    toggleCompanyMasterStatuses,
    deleteCompanyMasters
} from "../../Models/CompanyMaster/CompanyMasterModel.js";


// GET COMPANY MASTER

export const getCompanyMaster = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (parseInt(flagId) === 1) {

            const companyMasters = await getAllCompanyMasters();

            return res.status(200).json({
                status: "success",
                message: "CompanyMaster records fetched successfully",
                data: companyMasters
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });

        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }
};


// ADD COMPANY MASTER

export const addCompanyMaster = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (parseInt(flagId) === 2) {

            const {
                CompanyName,
                CompanyCode,
                ContactNumber,
                EmailId,
                GSTNo,
                PanNo,
                Address,
                CreatedByUserName
            } = req.body;


            // VALIDATE COMPANY NAME

            if (!CompanyName || !CompanyName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyName is required"
                });

            }

            if (CompanyName.length > 100 || !/^[A-Za-z0-9\s.&(),'/-]+$/.test(CompanyName)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyName. Maximum 100 characters allowed"
                });

            }


            // VALIDATE COMPANY CODE

            if (!CompanyCode || !CompanyCode.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyCode is required"
                });

            }

            if (CompanyCode.length > 20 || !/^[A-Za-z0-9_-]+$/.test(CompanyCode)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyCode. Maximum 20 characters allowed"
                });

            }


            // VALIDATE CONTACT NUMBER

            if (ContactNumber && !/^[0-9]{10}$/.test(ContactNumber)) {

                return res.status(400).json({
                    status: "error",
                    message: "ContactNumber must contain exactly 10 digits"
                });

            }


            // VALIDATE EMAIL

            if (EmailId && (EmailId.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailId))) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid EmailId"
                });

            }


            // VALIDATE GST NUMBER

            if (GSTNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(GSTNo)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid GSTNo"
                });

            }


            // VALIDATE PAN NUMBER

            if (PanNo && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(PanNo)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid PanNo"
                });

            }


            // CHECK DUPLICATE COMPANY NAME AND COMPANY CODE

            const existingCompany = await checkCompanyMasterExists(
                CompanyName,
                CompanyCode
            );

            if (existingCompany.length > 0) {

                const nameExists = existingCompany.some(company => company.CompanyName === CompanyName);
                const codeExists = existingCompany.some(company => company.CompanyCode === CompanyCode);

                if (nameExists && codeExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyName and CompanyCode already exist"
                    });

                }

                if (nameExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyName already exists"
                    });

                }

                if (codeExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyCode already exists"
                    });

                }

            }


            // CHECK DUPLICATE CONTACT NUMBER

            if (ContactNumber) {

                const existingContact = await checkCompanyMasterContactExists(ContactNumber);

                if (existingContact.length > 0) {

                    return res.status(409).json({
                        status: "error",
                        message: "ContactNumber already exists"
                    });

                }

            }


            // CHECK DUPLICATE EMAIL

            if (EmailId) {

                const existingEmail = await checkCompanyMasterEmailExists(EmailId);

                if (existingEmail.length > 0) {

                    return res.status(409).json({
                        status: "error",
                        message: "EmailId already exists"
                    });

                }

            }


            // ADD COMPANY MASTER

            const companyData = {
                CompanyName,
                CompanyCode,
                ContactNumber,
                EmailId,
                GSTNo,
                PanNo,
                Address,
                CreatedByUserName,
                IsDisabled: false
            };

            const newCompanyMaster = await addCompanyMasterModel(companyData);

            return res.status(201).json({
                status: "success",
                message: "CompanyMaster added successfully",
                data: newCompanyMaster
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });

        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }
};


// UPDATE COMPANY MASTER

export const updateCompanyMaster = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (parseInt(flagId) === 3) {

            const {
                CompanyMasterId,
                CompanyName,
                CompanyCode,
                ContactNumber,
                EmailId,
                GSTNo,
                PanNo,
                Address,
                UpdatedByUserName
            } = req.body;


            // VALIDATE COMPANY MASTER ID

            if (!CompanyMasterId || !Number.isInteger(Number(CompanyMasterId)) || Number(CompanyMasterId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyMasterId is required"
                });

            }


            // VALIDATE COMPANY NAME

            if (!CompanyName || !CompanyName.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyName is required"
                });

            }

            if (CompanyName.length > 100 || !/^[A-Za-z0-9\s.&(),'/-]+$/.test(CompanyName)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyName. Maximum 100 characters allowed"
                });

            }


            // VALIDATE COMPANY CODE

            if (!CompanyCode || !CompanyCode.trim()) {

                return res.status(400).json({
                    status: "error",
                    message: "CompanyCode is required"
                });

            }

            if (CompanyCode.length > 20 || !/^[A-Za-z0-9_-]+$/.test(CompanyCode)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid CompanyCode. Maximum 20 characters allowed"
                });

            }


            // VALIDATE CONTACT NUMBER

            if (ContactNumber && !/^[0-9]{10}$/.test(ContactNumber)) {

                return res.status(400).json({
                    status: "error",
                    message: "ContactNumber must contain exactly 10 digits"
                });

            }


            // VALIDATE EMAIL

            if (EmailId && (EmailId.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(EmailId))) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid EmailId"
                });

            }


            // VALIDATE GST NUMBER

            if (GSTNo && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(GSTNo)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid GSTNo"
                });

            }


            // VALIDATE PAN NUMBER

            if (PanNo && !/^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(PanNo)) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid PanNo"
                });

            }


            // CHECK DUPLICATE COMPANY NAME AND COMPANY CODE

            const existingCompany = await checkCompanyMasterExistsForUpdate(
                CompanyName,
                CompanyCode,
                CompanyMasterId
            );

            if (existingCompany.length > 0) {

                const nameExists = existingCompany.some(company => company.CompanyName === CompanyName);
                const codeExists = existingCompany.some(company => company.CompanyCode === CompanyCode);

                if (nameExists && codeExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyName and CompanyCode already exist"
                    });

                }

                if (nameExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyName already exists"
                    });

                }

                if (codeExists) {

                    return res.status(409).json({
                        status: "error",
                        message: "CompanyCode already exists"
                    });

                }

            }


            // CHECK DUPLICATE CONTACT NUMBER

            if (ContactNumber) {

                const existingContact = await checkCompanyMasterContactExistsForUpdate(
                    ContactNumber,
                    CompanyMasterId
                );

                if (existingContact.length > 0) {

                    return res.status(409).json({
                        status: "error",
                        message: "ContactNumber already exists"
                    });

                }

            }


            // CHECK DUPLICATE EMAIL

            if (EmailId) {

                const existingEmail = await checkCompanyMasterEmailExistsForUpdate(
                    EmailId,
                    CompanyMasterId
                );

                if (existingEmail.length > 0) {

                    return res.status(409).json({
                        status: "error",
                        message: "EmailId already exists"
                    });

                }

            }


            // UPDATE COMPANY MASTER

            const companyData = {
                CompanyMasterId,
                CompanyName,
                CompanyCode,
                ContactNumber,
                EmailId,
                GSTNo,
                PanNo,
                Address,
                UpdatedByUserName
            };

            const updatedCompanyMaster = await updateCompanyMasters(companyData);

            if (!updatedCompanyMaster) {

                return res.status(404).json({
                    status: "error",
                    message: "CompanyMaster not found"
                });

            }

            return res.status(200).json({
                status: "success",
                message: "CompanyMaster updated successfully",
                data: updatedCompanyMaster
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });

        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }
};


// TOGGLE COMPANY MASTER STATUS

export const toggleCompanyMasterStatus = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (parseInt(flagId) === 4) {

            const {
                CompanyMasterId,
                IsDisabled,
                UpdatedByUserName
            } = req.body;


            // VALIDATE COMPANY MASTER ID

            if (!CompanyMasterId || !Number.isInteger(Number(CompanyMasterId)) || Number(CompanyMasterId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyMasterId is required"
                });

            }


            // VALIDATE ISDISABLED

            if (
                IsDisabled === undefined ||
                ![true, false, "true", "false"].includes(IsDisabled)
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "IsDisabled must be true or false"
                });

            }


            // TOGGLE COMPANY MASTER STATUS

            const companyData = {
                CompanyMasterId,
                IsDisabled: IsDisabled === true || IsDisabled === "true",
                UpdatedByUserName
            };

            const updatedCompanyMaster = await toggleCompanyMasterStatuses(companyData);

            if (!updatedCompanyMaster) {

                return res.status(404).json({
                    status: "error",
                    message: "CompanyMaster not found"
                });

            }

            return res.status(200).json({
                status: "success",
                message: "CompanyMaster status updated successfully",
                data: updatedCompanyMaster
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });

        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }
};


// DELETE COMPANY MASTER

export const deleteCompanyMaster = async (req, res) => {

    const { flagId } = req.body;

    try {

        if (parseInt(flagId) === 5) {

            const { CompanyMasterId } = req.body;


            // VALIDATE COMPANY MASTER ID

            if (!CompanyMasterId || !Number.isInteger(Number(CompanyMasterId)) || Number(CompanyMasterId) <= 0) {

                return res.status(400).json({
                    status: "error",
                    message: "Valid CompanyMasterId is required"
                });

            }


            // DELETE COMPANY MASTER

            const companyData = { CompanyMasterId };

            const deletedCompanyMaster = await deleteCompanyMasters(companyData);

            if (!deletedCompanyMaster) {

                return res.status(404).json({
                    status: "error",
                    message: "CompanyMaster not found"
                });

            }

            return res.status(200).json({
                status: "success",
                message: "CompanyMaster deleted successfully",
                data: deletedCompanyMaster
            });

        } else {

            return res.status(400).json({
                status: "error",
                message: "Invalid flagId"
            });

        }

    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Internal server error",
            error: error.message
        });

    }
};
