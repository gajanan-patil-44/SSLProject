import { pool } from "../../Config/db.js"; 

export const getAllUserDetails = async () => {
    try {
        let query = `
        SELECT
    u."UserId",
    u."EmployeeId",
    u."FirstName",
    u."MiddleName",
    u."LastName",
    u."Email",
    u."LoginName",
    r."RoleName",
    c."CompanyName",
	p."ProductName",
	pr."ProjectName"

FROM "DATA"."User" u

LEFT JOIN "DATA"."UserRole" ur
    ON ur."UserId" = u."UserId"

LEFT JOIN "LKP"."Role" r
    ON r."RoleId" = ur."RoleId"

LEFT JOIN "LKP"."CompanyProduct" cp
    ON cp."CompanyProductId" = ur."CompanyProductId"

LEFT JOIN "LKP"."Company" c
    ON c."CompanyId" = cp."CompanyId"

LEFT JOIN "LKP"."Product" p
    ON p."ProductId" = cp."ProductId"

LEFT JOIN "LKP"."Project" pr
    ON pr."ProjectId" = ur."ProjectId"
    `;
        const result = await pool.query(query);
        return result.rows
    } catch (error) {
        throw error
    }
}


export const editUserdetails=async({
    EmployeeId,           
    FirstName,             
    MiddleName,          
    LastName,          
    PhoneNumber,           
    DateOfBirth,          
    GenderId,               
    MaritalStatusId,        
    DesignationId,          
    Email,                  
    LoginName,              
    AltPhoneNumber,         
    DateOfJoining,          
    UpdatedByUserName,      
    UserId     
})=>{
    try {
        let query=`UPDATE "DATA"."User"
SET
    "EmployeeId" = $1,
    "FirstName" = $2,
    "MiddleName" = $3,
    "LastName" = $4,
    "PhoneNumber" = $5,
    "DateOfBirth" = $6,
    "GenderId" = $7,
    "MaritalStatusId" = $8,
    "DesignationId" = $9,
    "Email" = $10,
    "LoginName" = $11,
    "AltPhoneNumber" = $12,
    "DateOfJoining" = $13,
    "UpdatedAt" = CURRENT_TIMESTAMP,
    "UpdatedByUserName" = $14
WHERE "UserId" = $15
RETURNING
    "UserId",
    "EmployeeId",
    "FirstName",
    "MiddleName",
    "LastName",
    "PhoneNumber",
    "DateOfBirth",
    "GenderId",
    "MaritalStatusId",
    "DesignationId",
    "Email",
    "LoginName",
    "AltPhoneNumber",
    "DateOfJoining",
    "UpdatedAt",
    "UpdatedByUserName";`;

    const values = [
    EmployeeId,           
    FirstName,             
    MiddleName,          
    LastName,          
    PhoneNumber,           
    DateOfBirth,          
    GenderId,               
    MaritalStatusId,        
    DesignationId,          
    Email,                  
    LoginName,              
    AltPhoneNumber,         
    DateOfJoining,          
    UpdatedByUserName,      
    UserId                  
];
    const result=await pool.query(query,values);
    return result.rows[0]
    } catch (error) {
        throw error
    }
}