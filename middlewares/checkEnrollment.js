import { supabaseAdmin } from "../config/supabase.js";

export const checkEnrollment = async (req, res, next) => {
    try {

        const userId = req.user.id;

        // const { courseId } = req.params;
        const { id: courseId } = req.params;

        const { data: enrollment, error } = await supabaseAdmin
            .from("enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        if (!enrollment) {
            return res.status(403).json({
                error: "Access denied. Enroll first."
            });
        }

        next();

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};