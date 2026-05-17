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