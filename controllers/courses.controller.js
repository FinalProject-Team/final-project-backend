import { fetchCourses } from "../services/courses.service.js";

export const getCourses = async (req, res) => {

    try {

        const data = await fetchCourses();

        res.json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

export const getSingleCourse = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
};