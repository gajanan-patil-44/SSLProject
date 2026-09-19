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
    insertPageRole
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

        if (FlagId === undefined || FlagId === null || FlagId === "") {
            return res.status(400).json({
                status: "error",
                message: "FlagId is required"
            });
        }

        const flagId = Number(FlagId);

        if (!Number.isInteger(flagId) || flagId <= 0
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid FlagId"
            });
        }

        // =====================================================
        // FLAG 1 - ROLES
        // =====================================================
        if (flagId === 1) {
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
        if (flagId === 2) {
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
        if (flagId === 3) {
            if (mainPageId === undefined || mainPageId === null || mainPageId === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "mainPageId is required"
                });
            }

            const mainId = Number(mainPageId);

            if (!Number.isInteger(mainId) || mainId <= 0) {
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
        if (flagId === 4) {
            if (parentPageId === undefined || parentPageId === null || parentPageId === ""
            ) {
                return res.status(400).json({
                    status: "error",
                    message: "parentPageId is required"
                });
            }

            const parentId = Number(parentPageId);

            if (!Number.isInteger(parentId) || parentId <= 0
            ) {
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
// =========================================================
// ADD PAGE
// =========================================================
export const addPage = async (req, res) => {
    let client = null;
    let transactionStarted = false;
    try {

        const {
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
        // BASIC VALIDATION
        // =====================================================

        if (
            !PageName ||
            typeof PageName !== "string" ||
            PageName.trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "PageName is required"
            });
        }


        if (
            !PageUrl ||
            typeof PageUrl !== "string" ||
            PageUrl.trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "PageUrl is required"
            });
        }


        if (
            !PageIcon ||
            typeof PageIcon !== "string" ||
            PageIcon.trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "PageIcon is required"
            });
        }


        if (
            !CreatedByUserName ||
            typeof CreatedByUserName !== "string" ||
            CreatedByUserName.trim() === ""
        ) {

            return res.status(400).json({
                status: "error",
                message: "CreatedByUserName is required"
            });
        }


        // =====================================================
        // PAGE TYPE VALIDATION
        // =====================================================

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


        // =====================================================
        // ROLE VALIDATION
        // =====================================================

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
                RoleIds.map(id => Number(id))
            )
        ];


        for (const roleId of uniqueRoleIds) {

            if (
                !Number.isInteger(roleId) ||
                roleId <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid RoleId"
                });
            }
        }


        // =====================================================
        // IS CHANGE ORDER
        // =====================================================

        const changeOrder =
            IsChangeOrder === true ||
            IsChangeOrder === "true";


        // =====================================================
        // ORDER VALIDATION
        // Only required when IsChangeOrder = true
        // =====================================================

        let orderType = null;
        let targetId = null;


        if (changeOrder) {

            if (
                !OrderType ||
                typeof OrderType !== "string" ||
                OrderType.trim() === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "OrderType is required when IsChangeOrder is true"
                });
            }


            orderType =
                OrderType.trim().toUpperCase();


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


            if (
                TargetPageId === undefined ||
                TargetPageId === null ||
                TargetPageId === ""
            ) {

                return res.status(400).json({
                    status: "error",
                    message:
                        "TargetPageId is required when IsChangeOrder is true"
                });
            }


            targetId = Number(TargetPageId);


            if (
                !Number.isInteger(targetId) ||
                targetId <= 0
            ) {

                return res.status(400).json({
                    status: "error",
                    message: "Invalid TargetPageId"
                });
            }
        }


        // =====================================================
        // START DATABASE CONNECTION
        // =====================================================

        client = await pool.connect();

        await client.query("BEGIN");

        transactionStarted = true;


        let orderNo = 0;
        let pageParentId = null;


        // =====================================================
        // 1. MAIN PAGE
        // =====================================================

        if (PageType === PAGE_TYPES.MAIN) {

            // -------------------------------------------------
            // Main Page cannot have ParentPageId
            // -------------------------------------------------

            if (
                ParentPageId !== null &&
                ParentPageId !== undefined &&
                ParentPageId !== ""
            ) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPageId must be null for MainPage"
                });
            }


            // -------------------------------------------------
            // Main Page - No Order Change
            // -------------------------------------------------

            if (!changeOrder) {

                const maxOrder =
                    await getNextMainPageOrder(client);


                orderNo =
                    Number(maxOrder) + 1;
            }


            // -------------------------------------------------
            // Main Page - Order Change
            // -------------------------------------------------

            else {

                const targetPage =
                    await getPageById(
                        client,
                        targetId
                    );


                if (!targetPage) {

                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(400).json({
                        status: "error",
                        message: "Target Page not found"
                    });
                }


                // Target must be MainPage

                if (
                    targetPage.ParentPageId !== null
                ) {

                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(400).json({
                        status: "error",
                        message:
                            "TargetPageId must belong to a MainPage"
                    });
                }


                const targetOrder =
                    Number(targetPage.OrderNo);


                // -------------------------------------------------
                // BEFORE
                // -------------------------------------------------

                if (orderType === "BEFORE") {

                    orderNo =
                        Number(
                            targetOrder.toFixed(3)
                        );


                    await shiftMainPageOrders(
                        client,
                        targetOrder,
                        1.000
                    );
                }


                // -------------------------------------------------
                // AFTER
                // -------------------------------------------------

                else {

                    orderNo =
                        Number(
                            (
                                targetOrder + 1.000
                            ).toFixed(3)
                        );


                    await shiftMainPageOrders(
                        client,
                        orderNo,
                        1.000
                    );
                }
            }
        }


        // =====================================================
        // 2. PARENT PAGE
        // =====================================================

        else if (PageType === PAGE_TYPES.PARENT) {

            // -------------------------------------------------
            // ParentPageId is REQUIRED
            // It must contain MainPageId
            // -------------------------------------------------

            if (
                ParentPageId === null ||
                ParentPageId === undefined ||
                ParentPageId === ""
            ) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPageId is required for ParentPage"
                });
            }


            const mainPageId =
                Number(ParentPageId);


            if (
                !Number.isInteger(mainPageId) ||
                mainPageId <= 0
            ) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "Invalid ParentPageId for ParentPage"
                });
            }


            // -------------------------------------------------
            // Verify selected page is MainPage
            // -------------------------------------------------

            const mainPage =
                await checkMainPage(
                    client,
                    mainPageId
                );


            if (mainPage.length === 0) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPageId must refer to a valid MainPage"
                });
            }


            // -------------------------------------------------
            // Parent Page URL must be #
            // -------------------------------------------------

            if (PageUrl.trim() !== "#") {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "PageUrl must be # for ParentPage"
                });
            }


            pageParentId = mainPageId;


            // -------------------------------------------------
            // Parent Page - No Order Change
            // -------------------------------------------------

            if (!changeOrder) {

                const maxOrder =
                    await getNextChildOrder(
                        client,
                        mainPageId
                    );


                const max =
                    Number(maxOrder);


                const mainPageData =
                    await getPageById(
                        client,
                        mainPageId
                    );


                const mainOrder =
                    Number(mainPageData.OrderNo);


                if (max === 0) {

                    orderNo =
                        Number(
                            (
                                mainOrder + 0.100
                            ).toFixed(3)
                        );

                } else {

                    orderNo =
                        Number(
                            (
                                max + 0.100
                            ).toFixed(3)
                        );
                }
            }


            // -------------------------------------------------
            // Parent Page - Order Change
            // -------------------------------------------------

            else {

                const targetPage =
                    await getPageById(
                        client,
                        targetId
                    );


                if (!targetPage) {

                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(400).json({
                        status: "error",
                        message: "Target Page not found"
                    });
                }


                // Target must be ParentPage
                // Target's ParentPageId must equal
                // selected MainPageId

                if (
                    Number(targetPage.ParentPageId) !==
                    mainPageId
                ) {

                    await client.query("ROLLBACK");
                    transactionStarted = false;

                    return res.status(400).json({
                        status: "error",
                        message:
                            "TargetPageId must belong to the selected MainPage"
                    });
                }


                const targetOrder =
                    Number(targetPage.OrderNo);


                // -------------------------------------------------
                // BEFORE
                // -------------------------------------------------

                if (orderType === "BEFORE") {

                    orderNo =
                        Number(
                            targetOrder.toFixed(3)
                        );


                    await shiftSiblingPageOrders(
                        client,
                        mainPageId,
                        targetOrder,
                        0.100
                    );
                }


                // -------------------------------------------------
                // AFTER
                // -------------------------------------------------

                else {

                    orderNo =
                        Number(
                            (
                                targetOrder + 0.100
                            ).toFixed(3)
                        );


                    await shiftSiblingPageOrders(
                        client,
                        mainPageId,
                        orderNo,
                        0.100
                    );
                }
            }
        }


        // =====================================================
        // 3. CHILD PAGE
        // =====================================================

        else if (PageType === PAGE_TYPES.CHILD) {

            // -------------------------------------------------
            // ParentPageId is REQUIRED
            // It must contain ParentPageId
            // -------------------------------------------------

            if (
                ParentPageId === null ||
                ParentPageId === undefined ||
                ParentPageId === ""
            ) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPageId is required for ChildPage"
                });
            }


            const parentPageId =
                Number(ParentPageId);


            if (
                !Number.isInteger(parentPageId) ||
                parentPageId <= 0
            ) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "Invalid ParentPageId for ChildPage"
                });
            }


            // -------------------------------------------------
            // Get selected Parent Page
            // -------------------------------------------------

            const selectedParentPage =
                await getPageById(
                    client,
                    parentPageId
                );


            if (!selectedParentPage) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "Selected ParentPageId was not found"
                });
            }


            // -------------------------------------------------
            // Selected page must itself have a MainPage
            // -------------------------------------------------

            if (selectedParentPage.ParentPageId === null) {

                await client.query("ROLLBACK");
                transactionStarted = false;

                return res.status(400).json({
                    status: "error",
                    message:
                        "ParentPageId must refer to a valid ParentPage, not a MainPage"
                });
            }

            const mainPage = await getPageById(client, Number(selectedParentPage.ParentPageId));

            if (!mainPage || mainPage.ParentPageId !== null) {
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
                    orderNo = Number((parentOrder + 0.010).toFixed(3));

                } else {
                    orderNo = Number((max + 0.010).toFixed(3));
                }
            }


            // -------------------------------------------------
            // Child Page - Order Change
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


                // Target must belong to same ParentPage

                if (
                    Number(targetPage.ParentPageId) !== parentPageId
                ) {
                    await client.query("ROLLBACK");
                    transactionStarted = false;
                    return res.status(400).json({
                        status: "error",
                        message: "TargetPageId must belong to the selected ParentPage"
                    });
                }

                const targetOrder = Number(targetPage.OrderNo);

                if (orderType === "BEFORE") {
                    orderNo = Number(targetOrder.toFixed(3));
                    await shiftSiblingPageOrders(client, parentPageId, targetOrder, 0.010);
                }

                else {
                    orderNo = Number((targetOrder + 0.010).toFixed(3));
                    await shiftSiblingPageOrders(client, parentPageId, orderNo, 0.010);
                }
            }
        }
        // =====================================================
        // INSERT PAGE
        // =====================================================

        const page = await insertPage(client,
            {
                PageName: PageName.trim(),
                PageUrl: PageUrl.trim(),
                PageIcon: PageIcon.trim(),
                ParentPageId: pageParentId,
                OrderNo: orderNo,
                CreatedByUserName: CreatedByUserName.trim()
            }
        );

        // =====================================================
        // INSERT PAGE ROLES
        // =====================================================

        for (const roleId of uniqueRoleIds) {
            await insertPageRole(client, page.PageId, roleId, CreatedByUserName.trim());
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

    } catch (error) {
        if (client && transactionStarted) {
            await client.query("ROLLBACK");
        }

        return res.status(500).json({
            status: "error",
            message: "Failed to create page"
        });

    } finally {

        if (client) {
            client.release();
        }
    }
};