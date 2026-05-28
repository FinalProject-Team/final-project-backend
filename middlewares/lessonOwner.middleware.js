import supabase from "../config/supabase.js";

export const lessonOwner = async (req, res, next) => {
    try {
        const lessonId = req.params.id;

        // نجيب lesson
        const { data: lesson } = await supabase
            .from("lessons")
            .select("course_id")
            .eq("id", lessonId)
            .single();

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        // نجيب course بتاع lesson
        const { data: course } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", lesson.course_id)
            .single();

        // لو instructor مش صاحب الكورس
        if (
            req.profile.role === "instructor" &&
            course.instructor_id !== req.profile.id
        ) {
            return res.status(403).json({
                message: "Not your lesson"
            });
        }

        next();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};