// import supabase from "../config/supabase.js";
import supabase, { supabaseAdmin } from "../config/supabase.js";

export const enrollCourse = async (req, res) => {

    try {

        const userId = req.user.id;
        const { courseId } = req.params;

        // check course
        const { data: course } = await supabase
            .from("courses")
            .select("*")
            .eq("id", courseId)
            .maybeSingle();

        if (!course) {
            return res.status(404).json({
                message: "Course not found"
            });
        }

        // check existing enrollment
        const { data: existingEnrollment } = await supabase
            .from("enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", courseId)
            .maybeSingle();

        if (existingEnrollment) {
            return res.status(400).json({
                message: "Already enrolled"
            });
        }

        // enroll
        // const { data, error } = await supabase
        //     .from("enrollments")
        const { data, error } = await supabaseAdmin
            .from("enrollments")
            .insert([
                {
                    user_id: userId,
                    course_id: courseId,
                    payment_status: "completed",
                    plan_type: "free"
                }
            ])
            .select()
            .maybeSingle();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json({
            message: "Enrolled successfully",
            enrollment: data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};