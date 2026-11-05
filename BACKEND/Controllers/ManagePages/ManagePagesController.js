import {
    getRoles,
    getMainPages,
    getParentPages,
    getChildPages,
    checkMainPage,
    checkParentPage,
    getTargetPage,
    getPageById,
    getNextMainPageOrder,
    getNextChildOrder,
    shiftMainPageOrders,
    shiftParentPageOrders,
    shiftChildPageOrders,
    shiftSiblingPageOrders,
    insertPage,
    insertPageRole,
    getAllPages,
    updatePageStatus,
    updatePage
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
                    ParentPageId: page.ParentPageId,
                    PageType: page.PageType
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
            OrderType,
            TargetPageId,
            CreatedByUserName
        } = req.body;


        // =====================================================
        // FLAG 1 - ADD PAGE
        // =====================================================
        if (parseInt(FlagId) === 1) {

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
            if (PageType !== PAGE_TYPES.MAIN && PageType !== PAGE_TYPES.PARENT && PageType !== PAGE_TYPES.CHILD) {
                return res.status(400).json({
                    status: "error",
                    message: "Invalid PageType. Allowed values are MainPage, ParentPage, ChildPage"
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
            if (!Array.isArray(RoleIds) || RoleIds.length === 0
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
                if (isNaN(roleId) || roleId <= 0) {
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
                        message: "OrderType is required when IsChangeOrder is true"
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

export const editPage = async (req, res) => {

    let client;

    try {

<<<<<<< HEAD
       const {
    FlagId,
    PageId,
    PageName,
    PageUrl,
    PageIcon,
    PageType,
    ParentPageId,
    RoleIds,
    IsChangeOrder,
    OrderType,
    TargetPageId,
    UpdatedByUserName
} = req.body;



const validPageTypes = [
    "MainPage",
    "ParentPage",
    "ChildPage"
];

if (!validPageTypes.includes(PageType)) {
    return res.status(400).json({
        status: "error",
        message: "Invalid PageType"
    });
}
=======
        const {
            FlagId,
            PageId,
            PageName,
            PageUrl,
            PageIcon,
            PageType,
            ParentPageId,
            RoleIds,
            IsChangeOrder,
            OrderType,
            TargetPageId,
            UpdatedByUserName
        } = req.body;



        const validPageTypes = [
            "MainPage",
            "ParentPage",
            "ChildPage"
        ];

        if (!validPageTypes.includes(PageType)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid PageType"
            });
        }
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91
        // =====================================================
        // BASIC VALIDATION
        // =====================================================

        if (Number(FlagId) !== 2) {

            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId"
            });
        }


        const pageId = Number(PageId);

        if (!Number.isInteger(pageId) || pageId <= 0) {

            return res.status(400).json({
                status: "error",
                message: "Valid PageId is required"
            });
        }


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


        if (!UpdatedByUserName) {

            return res.status(400).json({
                status: "error",
                message: "UpdatedByUserName is required"
            });
        }


        // =====================================================
        // ROLE IDS VALIDATION
        // =====================================================

        let roleIds;

        if (RoleIds === undefined) {

            // Not provided: preserve existing roles
            roleIds = undefined;

        } else {

            let parsedRoleIds = RoleIds;

            if (typeof parsedRoleIds === "string") {
                try {
                    parsedRoleIds = JSON.parse(parsedRoleIds);
                } catch {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid RoleIds format"
                    });
                }
            }

            if (!Array.isArray(parsedRoleIds)) {
                return res.status(400).json({
                    status: "error",
                    message: "RoleIds must be an array"
                });
            }

            roleIds = [...new Set(parsedRoleIds.map(Number))];

            for (const roleId of roleIds) {
                if (!Number.isInteger(roleId) || roleId <= 0) {
                    return res.status(400).json({
                        status: "error",
                        message: "Invalid RoleId"
                    });
                }
            }
        }
        // =====================================================
        // CHANGE ORDER VALIDATION
        // =====================================================

        const changeOrder =
            IsChangeOrder === true ||
            IsChangeOrder === "true";


        let orderType = null;
        let targetPageId = null;


        if (changeOrder) {

            orderType =
                String(OrderType || "")
                    .toUpperCase();


            if (
                orderType !== "BEFORE" &&
                orderType !== "AFTER"
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "OrderType must be BEFORE or AFTER"
                });
            }


            targetPageId =
                Number(TargetPageId);


            if (
                !Number.isInteger(targetPageId) ||
                targetPageId <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "Valid TargetPageId is required"
                });
            }


            if (targetPageId === pageId) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "TargetPageId cannot be the same as PageId"
                });
            }
        }


        // =====================================================
        // DATABASE CONNECTION
        // =====================================================

        client = await pool.connect();

        await client.query("BEGIN");


        // =====================================================
        // GET CURRENT PAGE
        // =====================================================

        const currentPage = await getPageById(
            client,
            pageId
        );

        if (!currentPage) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                status: "error",
                message: "Page not found"
            });
        }

        // =====================================================
        // GET UPDATED VALUES OR KEEP EXISTING VALUES
        // =====================================================

        const updatedPageName =
            PageName !== undefined
                ? String(PageName).trim()
                : currentPage.PageName;

        const updatedPageUrl =
            PageUrl !== undefined
                ? String(PageUrl).trim()
                : currentPage.PageUrl;

        const updatedPageIcon =
            PageIcon !== undefined
                ? String(PageIcon).trim()
                : currentPage.PageIcon;

        const pageType =
<<<<<<< HEAD
           PageType;
=======
            PageType !== undefined
                ? PageType
                : currentPage.PageType;
>>>>>>> f42fe0e3df83107e70003ef2614b54218b50bd91

        const effectiveParentPageId =
            ParentPageId !== undefined
                ? ParentPageId
                : currentPage.ParentPageId;

        // =====================================================
        // VALIDATE UPDATED VALUES
        // =====================================================

        if (!validPageTypes.includes(pageType)) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message: "Invalid PageType"
            });
        }

        if (!updatedPageName) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message: "PageName is required"
            });
        }

        if (!updatedPageUrl) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message: "PageUrl is required"
            });
        }

        if (!updatedPageIcon) {
            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message: "PageIcon is required"
            });
        }

        // =====================================================
        // INITIALIZE PARENT AND ORDER
        // =====================================================

        let newParentPageId = currentPage.ParentPageId;

        let newOrderNo = Number(currentPage.OrderNo);

        // =====================================================
        // MAIN PAGE
        // =====================================================

        if (pageType === "MainPage") {

            // MainPage cannot have ParentPageId

            if (
                ParentPageId !== null &&
                ParentPageId !== undefined &&
                ParentPageId !== ""
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    status: "error",
                    message:
                        "MainPage cannot have ParentPageId"
                });
            }


            newParentPageId = null;


            // -------------------------------------------------
            // MAIN ORDER CHANGE
            // -------------------------------------------------

            if (changeOrder) {

                const targetPage =
                    await getTargetPage(
                        client,
                        targetPageId
                    );


                if (!targetPage) {

                    await client.query("ROLLBACK");

                    return res.status(404).json({
                        status: "error",
                        message:
                            "Target page not found"
                    });
                }


                if (
                    targetPage.PageType !==
                    "MainPage"
                ) {

                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        status: "error",
                        message:
                            "MainPage can only be ordered with another MainPage"
                    });
                }


                const targetOrder =
                    Number(targetPage.OrderNo);


                if (orderType === "BEFORE") {

                    newOrderNo =
                        targetOrder;


                    await shiftMainPageOrders(
                        client,
                        targetOrder,
                        1.000,
                        pageId
                    );

                } else {

                    newOrderNo =
                        Number(
                            (
                                targetOrder +
                                1.000
                            ).toFixed(3)
                        );


                    await shiftMainPageOrders(
                        client,
                        newOrderNo,
                        1.000,
                        pageId
                    );
                }
            }
        }


        // =====================================================
        // PARENT PAGE
        // =====================================================

        else if (pageType === "ParentPage") {

            const mainPageId =
                Number(ParentPageId);


            if (
                !Number.isInteger(mainPageId) ||
                mainPageId <= 0
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    status: "error",
                    message:
                        "Valid MainPageId is required"
                });
            }


            // ParentPage must belong to a MainPage

            const mainPage =
                await checkMainPage(
                    client,
                    mainPageId
                );


            if (!mainPage) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPage must belong to a valid MainPage"
                });
            }


            newParentPageId =
                mainPageId;


            // -------------------------------------------------
            // CHANGE PARENT ORDER
            // -------------------------------------------------

            if (changeOrder) {

                const targetPage =
                    await getTargetPage(
                        client,
                        targetPageId
                    );


                if (!targetPage) {

                    await client.query("ROLLBACK");

                    return res.status(404).json({
                        status: "error",
                        message:
                            "Target page not found"
                    });
                }


                // Target must be ParentPage

                if (
                    targetPage.PageType !==
                    "ParentPage"
                ) {

                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        status: "error",
                        message:
                            "ParentPage can only be ordered with another ParentPage"
                    });
                }


                // Target ParentPage must belong
                // to the selected MainPage

                if (
                    Number(
                        targetPage.ParentPageId
                    ) !== mainPageId
                ) {

                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        status: "error",
                        message:
                            "Target ParentPage must belong to the selected MainPage"
                    });
                }


                const targetOrder =
                    Number(targetPage.OrderNo);


                if (orderType === "BEFORE") {

                    newOrderNo =
                        targetOrder;


                    await shiftParentPageOrders(
                        client,
                        mainPageId,
                        targetOrder,
                        0.100,
                        pageId
                    );

                } else {

                    newOrderNo =
                        Number(
                            (
                                targetOrder +
                                0.100
                            ).toFixed(3)
                        );


                    await shiftParentPageOrders(
                        client,
                        mainPageId,
                        newOrderNo,
                        0.100,
                        pageId
                    );
                }
            }
        }


        // =====================================================
        // CHILD PAGE
        // =====================================================

        else if (pageType === "ChildPage") {

            const parentPageId =
                Number(ParentPageId);


            if (
                !Number.isInteger(parentPageId) ||
                parentPageId <= 0
            ) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    status: "error",
                    message:
                        "Valid ParentPageId is required"
                });
            }


            // ChildPage must belong to ParentPage

            const parentPage =
                await checkParentPage(
                    client,
                    parentPageId
                );


            if (!parentPage) {

                await client.query("ROLLBACK");

                return res.status(400).json({
                    status: "error",
                    message:
                        "ChildPage must belong to a valid ParentPage"
                });
            }


            newParentPageId =
                parentPageId;


            // -------------------------------------------------
            // CHANGE CHILD ORDER
            // -------------------------------------------------

            if (changeOrder) {

                const targetPage =
                    await getTargetPage(
                        client,
                        targetPageId
                    );


                if (!targetPage) {

                    await client.query("ROLLBACK");

                    return res.status(404).json({
                        status: "error",
                        message:
                            "Target page not found"
                    });
                }


                // Target must be ChildPage

                if (
                    targetPage.PageType !==
                    "ChildPage"
                ) {

                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        status: "error",
                        message:
                            "ChildPage can only be ordered with another ChildPage"
                    });
                }


                // Target ChildPage must belong
                // to selected ParentPage

                if (
                    Number(
                        targetPage.ParentPageId
                    ) !== parentPageId
                ) {

                    await client.query("ROLLBACK");

                    return res.status(400).json({
                        status: "error",
                        message:
                            "Target ChildPage must belong to the selected ParentPage"
                    });
                }


                const targetOrder =
                    Number(targetPage.OrderNo);


                if (orderType === "BEFORE") {

                    newOrderNo =
                        targetOrder;


                    await shiftChildPageOrders(
                        client,
                        parentPageId,
                        targetOrder,
                        0.010,
                        pageId
                    );

                } else {

                    newOrderNo =
                        Number(
                            (
                                targetOrder +
                                0.010
                            ).toFixed(3)
                        );


                    await shiftChildPageOrders(
                        client,
                        parentPageId,
                        newOrderNo,
                        0.010,
                        pageId
                    );
                }
            }
        }


        // =====================================================
        // INVALID PAGE TYPE
        // =====================================================

        else {

            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message:
                    "Invalid PageType"
            });
        }


        // =====================================================
        // UPDATE PAGE
        // =====================================================

        const updatedPage = await updatePage(
            client,
            pageId,
            updatedPageName,
            updatedPageUrl,
            updatedPageIcon,
            newParentPageId,
            newOrderNo,
            roleIds,
            UpdatedByUserName
        );


        if (!updatedPage) {

            await client.query("ROLLBACK");

            return res.status(400).json({
                status: "error",
                message:
                    "Page update failed"
            });
        }


        // =====================================================
        // COMMIT
        // =====================================================

        await client.query("COMMIT");


        // =====================================================
        // RESPONSE
        // =====================================================

        return res.status(200).json({

            status: "success",

            message:
                "Page updated successfully",

            data: {
                PageId:
                    updatedPage.PageId,

                PageName:
                    updatedPage.PageName,

                PageUrl:
                    updatedPage.PageUrl,

                PageIcon:
                    updatedPage.PageIcon,

                PageType:
                    pageType,

                ParentPageId:
                    updatedPage.ParentPageId,

                OrderNo:
                    updatedPage.OrderNo
            }
        });

    }

    catch (error) {

        if (client) {

            try {
                await client.query("ROLLBACK");
            } catch (rollbackError) {
                console.error(
                    "Rollback error:",
                    rollbackError
                );
            }
        }


        console.error(
            "editPage error:",
            error
        );


        return res.status(500).json({
            status: "error",
            message:
                "Failed to edit page",
            error:
                error.message
        });

    }

    finally {

        if (client) {
            client.release();
        }
    }
};