
// EMAIL VALIDATION

export const isValidEmail = (email) => {

    if (!email || typeof email !== "string") {
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(email.trim());
};


// EMPLOYEE NAME

export const getEmployeeName = (employee) => {

    const nameParts = [
        employee.FirstName,
        employee.MiddleName,
        employee.LastName
    ]
        .filter(
            (name) =>
                name !== null &&
                name !== undefined &&
                String(name).trim() !== ""
        )
        .map((name) => String(name).trim());

    return nameParts.join(" ") || "Employee";
};


// YEARS OF SERVICE

export const calculateYearsOfService = (dateOfJoining) => {

    if (!dateOfJoining) {
        return null;
    }

    const joiningDate = new Date(dateOfJoining);

    if (Number.isNaN(joiningDate.getTime())) {
        return null;
    }

    const today = new Date();

    let years =
        today.getFullYear() -
        joiningDate.getFullYear();

    const currentMonth = today.getMonth();
    const joiningMonth = joiningDate.getMonth();

    const currentDay = today.getDate();
    const joiningDay = joiningDate.getDate();

    if (
        currentMonth < joiningMonth ||
        (
            currentMonth === joiningMonth &&
            currentDay < joiningDay
        )
    ) {
        years--;
    }

    return years >= 0 ? years : null;
};