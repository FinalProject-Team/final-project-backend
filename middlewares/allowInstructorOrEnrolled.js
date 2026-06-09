import { checkEnrollment } from "./checkEnrollment.js";

export const allowInstructorOrEnrolled = async (req, res, next) => {
    const user = req.user;

    // 1. لو instructor أو admin → يدخل مباشرة
    if (user.role === "instructor" || user.role === "admin") {
        return next();
    }

    // 2. لو student → نعمل enrollment check
    return checkEnrollment(req, res, next);
};