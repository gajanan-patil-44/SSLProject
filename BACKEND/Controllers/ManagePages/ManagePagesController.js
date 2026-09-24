import {
    getRoles,
    getMainPages,
    getParentPages,
    getChildPages,
    checkMainPage,
    getPageById,
    getNextMainPageOrder,
    getNextChildOrder,
    shiftMainPageOrders,
    shiftSiblingPageOrders,
    insertPage,
    insertPageRole,
    getAllPages,
    updatePageStatus
} from "../../Models/ManagePages/ManagePageModels.js";

import { pool } from "../../Config/db.js";

const PAGE_TYPES = {
    MAIN: "MainPage",
    PARENT: "ParentPage",
    CHILD: "ChildPage"
};


export const getManagePageDropdown = async (req, res) => {
    try {
        const { FlagId, mainPageId, parentPageId } = req.body;
        // =====================================================
        // FLAG 1 - ROLES
        // =====================================================
        if (parseInt(FlagId) === 1) {
            const result = await getRoles();
            return res.status(200).json({
                status: "success",
                message: "Roles fetched successfully",
                data: result
            });
        }
        // =====================================================
        // FLAG 2 - MAIN PAGES
        // =====================================================
        if (parseInt(FlagId) === 2) {
            const result = await getMainPages();
            return res.status(200).json({
                status: "success",
                message: "Main pages fetched successfully",
                data: result
            });
        }
        // =====================================================
        // FLAG 3 - PARENT PAGES
        // Based on selected Main Page
        // =====================================================
        if (parseInt(FlagId) === 3) {
            const mainId = parseInt(mainPageId);
            if (isNaN(mainId) || mainId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid mainPageId"
                });
            }
            const result = await getParentPages(mainId);
            return res.status(200).json({
                status: "success",
                message: "Parent pages fetched successfully",
                data: result
            });
        }
        // =====================================================
        // FLAG 4 - CHILD PAGES
        // Based on selected Parent Page
        // =====================================================
        if (parseInt(FlagId) === 4) {
            const parentId = parseInt(parentPageId);
            if (isNaN(parentId) || parentId <= 0) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid parentPageId"
                });
            }
            const result = await getChildPages(parentId);
            return res.status(200).json({
                status: "success",
                message: "Child pages fetched successfully",
                data: result
            });
        }
        // =====================================================
        // INVALID FLAG
        // =====================================================
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Failed to fetch dropdown data"
        });
    }
};
// ==========================================================
// MANAGE PAGES
// ==========================================================
export const getManagePages = async (req, res) => {
    try {

        const { FlagId } = req.body;


        // =====================================================
        // FLAG 1 - VIEW PAGES
        // =====================================================

        if (parseInt(FlagId) === 1) {

            const pages = await getAllPages();

            const data = pages.map((page, index) => {
                return {
                    SlNo: index + 1,
                    PageId: page.PageId,
                    PageName: page.PageName,
                    IconName: page.PageIcon,
                    PageUrl: page.PageUrl,
                    ParentPage: page.ParentPageName || "-",
                    Roles: page.Roles || [],
                    IsDisabled: page.IsDisabled,
                    OrderNo: page.OrderNo,
                    ParentPageId: page.ParentPageId
                };
            });

            return res.status(200).json({
                success: true,
                message: "Pages fetched successfully",
                data
            });
        }


        // =====================================================
        // INVALID FLAG
        // =====================================================

        return res.status(400).json({
            success: false,
            message: "Invalid FlagId"
        });

    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch pages"
        });
    }
};
export const updateManagePageStatus = async (req, res) => {
    try {
        const { FlagId, PageId, IsDisabled } = req.body;
        // =====================================================
        // FLAG 2 - UPDATE PAGE STATUS
        // =====================================================
        if (parseInt(FlagId) === 2) {
            const pageId = parseInt(PageId);
            if (isNaN(pageId) || pageId <= 0) {
                return res.status(400).json({
                    success: "failed",
                    message: "Invalid PageId"
                });
            }
            // =================================================
            // VALIDATE IsDisabled
            // =================================================
            if (typeof IsDisabled !== "boolean") {
                return res.status(400).json({
                    success: "failed",
                    message: "IsDisabled must be a boolean"
                });
            }

            const page = await updatePageStatus(pageId, IsDisabled);
            // =================================================
            // PAGE NOT FOUND
            // =================================================

            if (!page) {
                return res.status(404).json({
                    success: "failed",
                    message: "Page not found"
                });
            }

            // =================================================
            // SUCCESS RESPONSE
            // =================================================
            return res.status(200).json({
                success: "success",
                message: "Page status updated successfully"
            });
        }
        // =====================================================
        // INVALID FLAG
        // =====================================================
        return res.status(400).json({
            success: "failed",
            message: "Invalid FlagId"
        });

    }
    catch (error) {
        return res.status(500).json({
            success: "failed",
            message: "Failed to update page status"
        });
    }
};
// =========================================================
// ADD PAGE
// =========================================================
export const addPage = async (req, res) => {

    let client = null;
    let transactionStarted = false;

    try {

        const {
            FlagId,
            PageName,
            PageUrl,
            PageIcon,
            PageType,
            ParentPageId,
            RoleIds,
            IsChangeOrder,  
            OrderType,   //befor after
            TargetPageId,
            CreatedByUserName
        } = req.body;


        // =====================================================
        // FLAG 1 - ADD PAGE
        // =====================================================

        if (parseInt(FlagId) === 1) {


            // =================================================
            // BASIC VALIDATION
            // =================================================

            if (!PageName) {
                return res.status(400).json({
                    status: "error",
                    message: "PageName is required"
                });
            }


            if (!PageUrl) {
                return res.status(400).json({
                    status: "error",
                    message: "PageUrl is required"
                });
            }


            if (!PageIcon) {
                return res.status(400).json({
                    status: "error",
                    message: "PageIcon is required"
                });
            }


            if (!CreatedByUserName) {
                return res.status(400).json({
                    status: "error",
                    message: "CreatedByUserName is required"
                });
            }


            // =================================================
            // PAGE TYPE VALIDATION
            // =================================================

            if (
                PageType !== PAGE_TYPES.MAIN &&
                PageType !== PAGE_TYPES.PARENT &&
                PageType !== PAGE_TYPES.CHILD
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "Invalid PageType. Allowed values are MainPage, ParentPage, ChildPage"
                });
            }


            // =================================================
            // ORDER INCREMENT
            // =================================================

            let orderIncrement = 0;

            if (PageType === PAGE_TYPES.MAIN) {
                orderIncrement = 1.000;
            }

            if (PageType === PAGE_TYPES.PARENT) {
                orderIncrement = 0.100;
            }

            if (PageType === PAGE_TYPES.CHILD) {
                orderIncrement = 0.010;
            }


            // =================================================
            // ROLE VALIDATION
            // =================================================

            if (
                !Array.isArray(RoleIds) ||
                RoleIds.length === 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "At least one RoleId is required"
                });
            }


            const uniqueRoleIds = [
                ...new Set(
                    RoleIds.map(id => parseInt(id))
                )
            ];


            for (const roleId of uniqueRoleIds) {

                if (
                    isNaN(roleId) ||
                    roleId <= 0
                ) {

                    return res.status(400).json({
                        status: "error",
                        message: "Invalid RoleId"
                    });
                }
            }


            // =================================================
            // IS CHANGE ORDER
            // =================================================

            const changeOrder = IsChangeOrder;


            // =================================================
            // ORDER VALIDATION
            // =================================================

            let orderType = null;
            let targetId = null;


            if (changeOrder) {

                if (!OrderType) {

                    return res.status(400).json({
                        status: "error",
                        message:
                            "OrderType is required when IsChangeOrder is true"
                    });
                }

                orderType = OrderType;

                if (orderType !== "BEFORE" && orderType !== "AFTER") {
                    return res.status(400).json({
                        status: "error",
                        message: "OrderType must be BEFORE or AFTER"
                    });
                }

                targetId = parseInt(TargetPageId);

                if (isNaN(targetId) || targetId <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid TargetPageId"
                    });
                }
            }
            // =================================================
            // START DATABASE TRANSACTION
            // =================================================
            client = await pool.connect();
            await client.query("BEGIN");
            transactionStarted = true;

            let orderNo = 0;
            let pageParentId = null;
            // =================================================
            // 1. MAIN PAGE
            // =================================================
            if (PageType === PAGE_TYPES.MAIN) {
                // -------------------------------------------------
                // Main Page cannot have ParentPageId
                // -------------------------------------------------
                if (ParentPageId !== null && ParentPageId !== undefined
                ) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "ParentPageId must be null for MainPage"
                    });
                }


                // -------------------------------------------------
                // Main Page - No Order Change
                // -------------------------------------------------
                if (!changeOrder) {
                    const maxOrder = await getNextMainPageOrder(client);
                    orderNo = Number(maxOrder) + orderIncrement;
                }

                // ------------------------------------------------
                // Main Page - Order Change
                // -------------------------------------------------
                else {
                    const targetPage = await getPageById(client, targetId);

                    if (!targetPage) {
                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "Target Page not found"
                        });
                    }

                    // Target must be MainPage
                    if (targetPage.ParentPageId !== null) {
                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "TargetPageId must belong to a MainPage"
                        });
                    }

                    const targetOrder = Number(targetPage.OrderNo);
                    // -------------------------------------------------
                    // BEFORE
                    // -------------------------------------------------
                    if (orderType === "BEFORE") {
                        orderNo = Number(targetOrder.toFixed(3));
                        await shiftMainPageOrders(client, targetOrder, orderIncrement
                        );
                    }

                    // ------------------------------------------------
                    // AFTER
                    // -------------------------------------------------
                    else {
                        orderNo = Number((targetOrder + orderIncrement).toFixed(3));
                        await shiftMainPageOrders(client, orderNo, orderIncrement);
                    }
                }
            }

            // =====================================================
            // 2. PARENT PAGE
            // =====================================================
            else if (PageType === PAGE_TYPES.PARENT) {
                const mainPageId = parseInt(ParentPageId);
                // -------------------------------------------------
                // Validate MainPageId
                // -------------------------------------------------

                if (isNaN(mainPageId) || mainPageId <= 0) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid ParentPageId for ParentPage"
                    });
                }
                // -------------------------------------------------
                // Verify selected page is MainPage
                // -------------------------------------------------
                const mainPage = await checkMainPage(client, mainPageId);

                if (mainPage.length === 0) {

                    await client.query("ROLLBACK");

                    transactionStarted = false;

                    return res.status(400).json({
                        status: "error",
                        message:
                            "ParentPageId must refer to a valid MainPage"
                    });
                }

                pageParentId = mainPageId;
                // -------------------------------------------------
                // Parent Page - No Order Change
                // -------------------------------------------------

                if (!changeOrder) {
                    const maxOrder = await getNextChildOrder(client, mainPageId);

                    const max = Number(maxOrder);
                    const mainPageData = await getPageById(client, mainPageId);


                    const mainOrder = Number(mainPageData.OrderNo);

                    if (max === 0) {
                        orderNo = Number((mainOrder + orderIncrement).toFixed(3));
                    } else {
                        orderNo = Number((max + orderIncrement).toFixed(3));
                    }
                }

                // -------------------------------------------------
                // Parent Page - Order Change
                // -------------------------------------------------
                else {
                    const targetPage = await getPageById(client, targetId);

                    if (!targetPage) {
                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "Target Page not found"
                        });
                    }


                    // Target must belong to selected MainPage
                    if (Number(targetPage.ParentPageId) !== mainPageId) {

                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "TargetPageId must belong to the selected MainPage"
                        });
                    }


                    const targetOrder = Number(targetPage.OrderNo);
                    // -------------------------------------------------
                    // BEFORE
                    // -------------------------------------------------
                    if (orderType === "BEFORE") {
                        orderNo = Number(targetOrder.toFixed(3));
                        await shiftSiblingPageOrders(client, mainPageId, targetOrder, orderIncrement
                        );
                    }
                    // -------------------------------------------------
                    // AFTER
                    // -------------------------------------------------
                    else {
                        orderNo = Number((targetOrder + orderIncrement).toFixed(3));
                        await shiftSiblingPageOrders(client, mainPageId, orderNo, orderIncrement);
                    }
                }
            }

            // =====================================================
            // 3. CHILD PAGE
            // =====================================================

            else if (PageType === PAGE_TYPES.CHILD) {
                const parentPageId = parseInt(ParentPageId);
                // -------------------------------------------------
                // Validate ParentPageId
                // -------------------------------------------------
                if (isNaN(parentPageId) || parentPageId <= 0) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid ParentPageId for ChildPage"
                    });
                }
                // -------------------------------------------------
                // Get selected ParentPage
                // -------------------------------------------------
                const selectedParentPage = await getPageById(client, parentPageId);

                if (!selectedParentPage) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "Selected ParentPageId was not found"
                    });
                }
                // -------------------------------------------------
                // Selected page must be ParentPage
                // -------------------------------------------------
                if (selectedParentPage.ParentPageId === null) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "ParentPageId must refer to a valid ParentPage, not a MainPage"
                    });
                }
                // -------------------------------------------------
                // Get MainPage of selected ParentPage
                // -------------------------------------------------
                const mainPage = await getPageById(client, parseInt(selectedParentPage.ParentPageId));

                if (!mainPage || mainPage.ParentPageId !== null
                ) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "Selected ParentPageId must refer to a valid ParentPage"
                    });
                }

                pageParentId = parentPageId;
                // -------------------------------------------------
                // Child Page - No Order Change
                // -------------------------------------------------
                if (!changeOrder) {
                    const maxOrder = await getNextChildOrder(client, parentPageId);

                    const max = Number(maxOrder);
                    const parentOrder = Number(selectedParentPage.OrderNo);

                    if (max === 0) {
                        orderNo = Number((parentOrder + orderIncrement).toFixed(3));
                    } else {
                        orderNo = Number((max + orderIncrement).toFixed(3));
                    }
                }
                // -------------------------------------------------
                // Child Page - Order Change
                // ------------------------------------------------
                else {
                    const targetPage = await getPageById(client, targetId);

                    if (!targetPage) {
                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "Target Page not found"
                        });
                    }


                    // Target must belong to selected ParentPage
                    if (Number(targetPage.ParentPageId) !== parentPageId
                    ) {

                        await client.query("ROLLBACK");
                        transactionStarted = false;
                        return res.status(400).json({
                            status: "error",
                            message: "TargetPageId must belong to the selected ParentPage"
                        });
                    }

                    const targetOrder = Number(targetPage.OrderNo);

                    // -------------------------------------------------
                    // BEFORE
                    // -------------------------------------------------
                    if (orderType === "BEFORE") {
                        orderNo = Number(targetOrder.toFixed(3));
                        await shiftSiblingPageOrders(client, parentPageId, targetOrder, orderIncrement);
                    }
                    // -------------------------------------------------
                    // AFTER
                    // -------------------------------------------------
                    else {
                        orderNo = Number((targetOrder + orderIncrement).toFixed(3));

                        await shiftSiblingPageOrders(client, parentPageId, orderNo, orderIncrement);
                    }
                }
            }
            // =====================================================
            // INSERT PAGE
            // =====================================================

            const page = await insertPage(client,
                {
                    PageName: PageName,
                    PageUrl: PageUrl,
                    PageIcon: PageIcon,
                    ParentPageId: pageParentId,
                    OrderNo: orderNo,
                    CreatedByUserName:
                        CreatedByUserName
                }
            );
            // =====================================================
            // INSERT PAGE ROLES
            // =====================================================

            for (const roleId of uniqueRoleIds) {
                await insertPageRole(client, page.PageId, roleId, CreatedByUserName);
            }
            await client.query("COMMIT");

            transactionStarted = false;


            // =====================================================
            // SUCCESS RESPONSE
            // =====================================================

            return res.status(201).json({
                status: "success",
                message: "Page created successfully",
                data: {
                    ...page,
                    PageType
                }
            });
        }
        // =====================================================
        // INVALID FLAG
        // =====================================================
        return res.status(400).json({
            status: "error",
            message: "Invalid FlagId"
        });

    }
    // =========================================================
    // ERROR
    // =========================================================

    catch (error) {
        if (client && transactionStarted
        ) {
            await client.query("ROLLBACK");
        }
        return res.status(500).json({
            status: "error",
            message: "Failed to create page"
        });
    }


    finally {
        if (client) {
            client.release();
        }
    }
};