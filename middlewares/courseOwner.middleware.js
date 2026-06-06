import supabase from "../config/supabase.js";

export const isCourseOwner = async (req, res, next) => {
    try {
        const instructorId = req.profile.id;
        const courseId = req.params.id;

        const { data, error } = await supabase
            .from("courses")
            .select("instructor_id")
            .eq("id", courseId)
            .single();

        if (error || !data) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (data.instructor_id !== instructorId) {
            return res.status(403).json({ message: "Not your course" });
        }

        next();

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};