import { pool } from "../../Config/db.js";

// =========================================================
// GET ROLES
// =========================================================
export const getRoles = async () => {

    const result = await pool.query(`
        SELECT
            "RoleId",
            "RoleName"
        FROM "LKP"."Role"
        WHERE COALESCE("IsDisabled", false) = false
        ORDER BY "RoleName" ASC;
    `);

    return result.rows;
};
// =========================================================
// GET MAIN PAGES
// =========================================================
export const getMainPages = async () => {

    const result = await pool.query(`
        SELECT
            "PageId",
            "PageName",
            "PageUrl",
            "PageIcon",
            "OrderNo"
        FROM "DATA"."Page"
        WHERE "ParentPageId" IS NULL
          AND COALESCE("IsDisabled", false) = false
        ORDER BY
            "OrderNo" ASC,
            "PageId" ASC;
    `);

    return result.rows;
};
// =========================================================
// GET PARENT PAGES
// =========================================================
export const getParentPages = async (mainPageId) => {

    const result = await pool.query(
        `
        SELECT
            "PageId",
            "PageName",
            "PageUrl",
            "PageIcon",
            "ParentPageId",
            "OrderNo"
        FROM "DATA"."Page"
        WHERE "ParentPageId" = $1
          AND COALESCE("IsDisabled", false) = false
        ORDER BY
            "OrderNo" ASC,
            "PageId" ASC;
        `,
        [mainPageId]
    );

    return result.rows;
};
// =========================================================
// GET CHILD PAGES
// =========================================================
export const getChildPages = async (parentPageId) => {
    const result = await pool.query(
        `
        SELECT
            "PageId",
            "PageName",
            "PageUrl",
            "PageIcon",
            "ParentPageId",
            "OrderNo"
        FROM "DATA"."Page"
        WHERE "ParentPageId" = $1
          AND COALESCE("IsDisabled", false) = false
        ORDER BY
            "OrderNo" ASC,
            "PageId" ASC;
        `,
        [parentPageId]
    );
    return result.rows;
};
// =========================================================
// CHECK MAIN PAGE
// =========================================================
export const checkMainPage = async (
    client,
    PageId
) => {

    const result = await client.query(
        `
        SELECT
            "PageId",
            "OrderNo"

        FROM "DATA"."Page"

        WHERE
            "PageId" = $1
            AND "ParentPageId" IS NULL
            AND "IsDisabled" = FALSE;
        `,
        [PageId]
    );

    return result.rows[0] || null;
};
// =========================================================
// CHECK PARENT PAGE
// =========================================================
export const checkParentPage = async (
    client,
    PageId
) => {

    const result = await client.query(
        `
        SELECT
            p."PageId",
            p."ParentPageId",
            p."OrderNo"

        FROM "DATA"."Page" p

        INNER JOIN "DATA"."Page" main
            ON main."PageId" = p."ParentPageId"

        WHERE
            p."PageId" = $1
            AND main."ParentPageId" IS NULL
            AND p."IsDisabled" = FALSE
            AND main."IsDisabled" = FALSE;
        `,
        [PageId]
    );

    return result.rows[0] || null;
};
// =========================================================
// GET PAGE
// =========================================================
export const getPageById = async (client,PageId) => {

    const result = await client.query(
        `
        SELECT
            p."PageId",
            p."PageName",
            p."PageUrl",
            p."PageIcon",
            p."ParentPageId",
            p."OrderNo",

            CASE
                WHEN p."ParentPageId" IS NULL
                    THEN 'MainPage'

                WHEN parent."ParentPageId" IS NULL
                    THEN 'ParentPage'

                ELSE 'ChildPage'
            END AS "PageType"

        FROM "DATA"."Page" p

        LEFT JOIN "DATA"."Page" parent
            ON parent."PageId" = p."ParentPageId"

        WHERE
            p."PageId" = $1
            AND p."IsDisabled" = FALSE;
        `,
        [PageId]
    );

    return result.rows[0] || null;
};

// =========================================================
// GET NEXT MAIN PAGE ORDER
// =========================================================
export const getNextMainPageOrder = async (client) => {
    const result = await client.query(`
        SELECT
            COALESCE(MAX("OrderNo"), 0) AS "MaxOrder"
        FROM "DATA"."Page"
        WHERE "ParentPageId" IS NULL;
    `);

    return result.rows[0].MaxOrder;
};
// =========================================================
// GET NEXT SIBLING ORDER
// =========================================================
export const getNextChildOrder = async (client, parentPageId) => {
    const result = await client.query(
        `
        SELECT
            COALESCE(MAX("OrderNo"), 0) AS "MaxOrder"
        FROM "DATA"."Page"
        WHERE "ParentPageId" = $1;
        `,
        [parentPageId]
    );
    return result.rows[0].MaxOrder;
};
// =========================================================
// SHIFT MAIN PAGE ORDER
// =========================================================
// Used for BEFORE / AFTER
// Moves complete main-page hierarchy.
// =========================================================

export const shiftMainPageOrders = async (
    client,
    TargetOrder,
    Increment,
    ExcludePageId
) => {

    await client.query(
        `
        UPDATE "DATA"."Page"

        SET
            "OrderNo" = ROUND(
                ("OrderNo" + $1)::numeric,
                3
            ),
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "ParentPageId" IS NULL
            AND "OrderNo" >= $2
            AND "PageId" <> $3
            AND "IsDisabled" = FALSE;
        `,
        [
            Increment,
            TargetOrder,
            ExcludePageId
        ]
    );
};


export const shiftParentPageOrders = async (
    client,
    MainPageId,
    TargetOrder,
    Increment,
    ExcludePageId
) => {

    await client.query(
        `
        UPDATE "DATA"."Page"

        SET
            "OrderNo" = ROUND(
                ("OrderNo" + $1)::numeric,
                3
            ),
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "ParentPageId" = $2
            AND "OrderNo" >= $3
            AND "PageId" <> $4
            AND "IsDisabled" = FALSE;
        `,
        [
            Increment,
            MainPageId,
            TargetOrder,
            ExcludePageId
        ]
    );
};

export const shiftChildPageOrders = async (
    client,
    ParentPageId,
    TargetOrder,
    Increment,
    ExcludePageId
) => {

    await client.query(
        `
        UPDATE "DATA"."Page"

        SET
            "OrderNo" = ROUND(
                ("OrderNo" + $1)::numeric,
                3
            ),
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE
            "ParentPageId" = $2
            AND "OrderNo" >= $3
            AND "PageId" <> $4
            AND "IsDisabled" = FALSE;
        `,
        [
            Increment,
            ParentPageId,
            TargetOrder,
            ExcludePageId
        ]
    );
};
// =========================================================
// SHIFT SIBLING PAGE ORDERS
// =========================================================
// Used for Parent / Child BEFORE / AFTER.
// =========================================================
export const shiftSiblingPageOrders = async (client, parentPageId, targetOrder, change) => {
    await client.query(
        `
        UPDATE "DATA"."Page"
        SET
            "OrderNo" = ROUND(("OrderNo" + $1)::numeric,3),
            "UpdatedAt" = CURRENT_TIMESTAMP
        WHERE "ParentPageId" = $2
          AND "OrderNo" >= $3
          AND COALESCE("IsDisabled", false) = false;
        `,
        [change, parentPageId, targetOrder]
    );
};
// =========================================================
// INSERT PAGE
// =========================================================
export const insertPage = async (client, pageData) => {
    const { PageName, PageUrl, PageIcon, ParentPageId, OrderNo, CreatedByUserName } = pageData;
    const result = await client.query(
        `
        INSERT INTO "DATA"."Page"
        (
            "PageName",
            "PageUrl",
            "PageIcon",
            "IsDisabled",
            "ParentPageId",
            "OrderNo",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES
        ($1,$2,$3,false,$4,$5,CURRENT_TIMESTAMP,$6)
        RETURNING
            "PageId",
            "PageName",
            "PageUrl",
            "PageIcon",
            "ParentPageId",
            "OrderNo";
        `,
        [PageName, PageUrl, PageIcon, ParentPageId, OrderNo, CreatedByUserName]
    );
    return result.rows[0];
};
// =========================================================
// INSERT PAGE ROLE
// =========================================================
export const insertPageRole = async (client, pageId, roleId, createdByUserName) => {
    await client.query(
        `
        INSERT INTO "DATA"."PageRole"
        (
            "PageId",
            "RoleId",
            "IsDisabled",
            "IsAllocated",
            "CreatedAt",
            "CreatedByUserName"
        )
        VALUES
        (
            $1,
            $2,
            false,
            true,
            CURRENT_TIMESTAMP,
            
            $3
            
        );
        `,
        [pageId, roleId, createdByUserName]
    );
};
// ==========================================================
// GET ALL PAGES
// ==========================================================
export const getAllPages = async () => {
    const query = `
        SELECT
            p."PageId",
            p."PageName",
            p."PageIcon",
            p."PageUrl",
            p."ParentPageId",
            p."IsDisabled",
            p."OrderNo",
            parent."PageName" AS "ParentPageName",
            json_agg(
                json_build_object(
                    'RoleId',
                    r."RoleId",

                    'RoleName',
                    r."RoleName"
                )
                ORDER BY r."RoleName"
            )
            FILTER (WHERE r."RoleId" IS NOT NULL) AS "Roles"
        FROM "DATA"."Page" p
        LEFT JOIN "DATA"."Page" parent
            ON parent."PageId" = p."ParentPageId"
        LEFT JOIN "DATA"."PageRole" pr
            ON pr."PageId" = p."PageId"
            AND pr."IsDisabled" = FALSE
            AND pr."IsAllocated" = TRUE
        LEFT JOIN
            "LKP"."Role" r
            ON r."RoleId" = pr."RoleId"
            AND r."IsDisabled" = FALSE
        GROUP BY

            p."PageId",
            p."PageName",
            p."PageIcon",
            p."PageUrl",
            p."ParentPageId",
            p."IsDisabled",
            p."OrderNo",
            parent."PageName"

        ORDER BY
            p."OrderNo" ASC,
            p."PageId" ASC
    `;
    const result = await pool.query(query);
    return result.rows;
};
// ==========================================================
// UPDATE PAGE STATUS
// ==========================================================
export const updatePageStatus = async (PageId, IsDisabled) => {
    const query = `
        UPDATE "DATA"."Page"
        SET
            "IsDisabled" = $1,
            "UpdatedAt" = CURRENT_TIMESTAMP

        WHERE "PageId" = $2
        RETURNING
            "PageId",
            "IsDisabled"
    `;
    const result = await pool.query(query, [IsDisabled, PageId]);
    return result.rows[0] || null;
};
// =========================================================
// UPDATE PAGE + PAGE ROLES
// =========================================================
export const updatePage = async (client, PageId, PageName, PageUrl, PageIcon, ParentPageId, OrderNo, RoleIds, UpdatedByUserName) => {
    // =====================================================
    // UPDATE PAGE
    // =====================================================
    const pageQuery = `
        UPDATE "DATA"."Page"
        SET
            "PageName" = $1,
            "PageUrl" = $2,
            "PageIcon" = $3,
            "ParentPageId" = $4,
            "OrderNo" = $5,
            "UpdatedAt" = CURRENT_TIMESTAMP,
            "UpdatedByUserName" = $6
        WHERE
            "PageId" = $7
            AND COALESCE("IsDisabled", FALSE) = FALSE
        RETURNING
            "PageId",
            "PageName",
            "PageUrl",
            "PageIcon",
            "ParentPageId",
            "OrderNo";
    `;
    const pageResult = await client.query(pageQuery, [PageName, PageUrl, PageIcon, ParentPageId, OrderNo, UpdatedByUserName, PageId]);
    const updatedPage = pageResult.rows[0] || null;
    if (!updatedPage) {
        return null;
    }
    // =====================================================
    // UPDATE / INSERT PAGE ROLES
    // =====================================================
    for (const RoleId of RoleIds) {
        const roleQuery = `
            UPDATE "DATA"."PageRole"
            SET
                "IsDisabled" = FALSE,
                "IsAllocated" = TRUE,
                "UpdatedAt" = CURRENT_TIMESTAMP,
                "UpdatedByUserName" = $3
            WHERE
                "PageId" = $1
                AND "RoleId" = $2
            RETURNING
                "PageRoleId";
        `;
        const roleResult = await client.query(roleQuery, [PageId, RoleId, UpdatedByUserName]);
        // =================================================
        // ROLE DOES NOT EXIST -> INSERT
        // =================================================
        if (roleResult.rowCount === 0) {
            await client.query(
                `
                INSERT INTO "DATA"."PageRole"
                (
                    "PageId",
                    "RoleId",
                    "IsDisabled",
                    "IsAllocated",
                    "CreatedAt",
                    "UpdatedAt",
                    "CreatedByUserName",
                    "UpdatedByUserName"
                )
                VALUES
                (
                    $1,
                    $2,
                    FALSE,
                    TRUE,
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP,
                    $3,
                    $3
                );
                `,
                [PageId, RoleId, UpdatedByUserName]
            );
        }
    }
    return updatedPage;
};

// =========================================================
// GET TARGET PAGE
// =========================================================

export const getTargetPage = async (
    client,
    TargetPageId
) => {

    const result = await client.query(
        `
        SELECT
            p."PageId",
            p."ParentPageId",
            p."OrderNo",

            CASE
                WHEN p."ParentPageId" IS NULL
                    THEN 'MainPage'

                WHEN parent."ParentPageId" IS NULL
                    THEN 'ParentPage'

                ELSE 'ChildPage'
            END AS "PageType"

        FROM "DATA"."Page" p

        LEFT JOIN "DATA"."Page" parent
            ON parent."PageId" = p."ParentPageId"

        WHERE
            p."PageId" = $1
            AND p."IsDisabled" = FALSE;
        `,
        [TargetPageId]
    );

    return result.rows[0] || null;
};