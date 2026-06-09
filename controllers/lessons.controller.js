import supabase from "../config/supabase.js";
import { supabaseAdmin } from "../config/supabase.js";

// export const getCourseLessons = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const { data, error } = await supabase
//             .from("lessons")
//             .select("*")
//             .eq("course_id", id)
//             .order("lesson_order", { ascending: true });

//         if (error) {
//             return res.status(400).json({
//                 error: error.message
//             });
//         }

//         res.status(200).json(data);

//     } catch (error) {
//         res.status(500).json({
//             error: error.message
//         });
//     }
// };

export const getCourseLessons = async (req, res) => {
    try {
        const { id } = req.params;

        const user = req.user;

        const isInstructorOrAdmin =
            user.role === "instructor" || user.role === "admin";

        let query = supabase
            .from("lessons")
            .select("*")
            .eq("course_id", id)
            .order("lesson_order", { ascending: true });

        // لو student → لازم يكون enrolled (هنتأكد من middleware أصلاً)
        // لو instructor/admin → عادي

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(200).json(data);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// console.log("🔥 CONTROLLER HIT");
export const createLesson = async (req, res) => {
    try {
        const lessonData = req.body;

        if (!lessonData.course_id || !lessonData.title) {
            return res.status(400).json({
                message: "course_id and title are required"
            });
        }

        const { data, error } = await supabaseAdmin
            .from("lessons")
            .insert([lessonData])
            .select();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json(data);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


export const updateLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const updatedData = req.body;

        const { data, error } = await supabaseAdmin
            .from("lessons")
            .update(updatedData)
            .eq("id", id)
            .select();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};


export const deleteLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("lessons")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json({
            message: "Lesson deleted successfully",
            data
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

export const getSingleLesson = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("lessons")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json(data);

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};