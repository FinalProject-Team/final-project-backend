import supabase from "../config/supabase.js";

export const lessonOwner = async (req, res, next) => {
    try {
        const lessonId = req.params.id;

        // 1. get lesson
        const { data: lesson, error: lessonError } = await supabase
            .from("lessons")
            .select("course_id")
            .eq("id", lessonId)
            .single();

        if (lessonError || !lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        // 2. get course owner
        const { data: course, error: courseError } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", lesson.course_id)
            .single();

        if (courseError || !course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // 3. admin bypass
        if (req.profile.role === "admin") {
            return next();
        }

        // 4. instructor check
        if (req.profile.role === "instructor") {
            if (course.instructor_id !== req.profile.id) {
                return res.status(403).json({
                    message: "Not your lesson"
                });
            }
            return next();
        }

        // 5. block others
        return res.status(403).json({
            message: "Forbidden"
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};