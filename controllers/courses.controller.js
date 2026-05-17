import { fetchCourses } from "../services/courses.service.js";
import supabase from "../config/supabase.js";
// export const getCourses = async (req, res) => {

//     try {

//         const data = await fetchCourses();

//         res.json(data);

//     } catch (error) {

//         res.status(500).json({
//             error: error.message
//         });

//     }
// };

export const getCourses = async (req, res) => {
    try {

        const search = req.query.search;

        let query = supabase
            .from("courses")
            .select("*");

        if (search) {
            query = query.ilike("title", `%${search}%`);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
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
        console.log(error);

        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);
};

export const createCourse = async (req, res) => {

    const courseData = req.body;

    const { data, error } = await supabase
        .from("courses")
        .insert([courseData])
        .select();

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.status(201).json(data);

};

export const updateCourse = async (req, res) => {

    const { id } = req.params;

    const updatedData = req.body;

    const { data, error } = await supabase
        .from("courses")
        .update(updatedData)
        .eq("id", id)
        .select();

    if (error) {
        return res.status(500).json({
            error: error.message
        });
    }

    res.json(data);

};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("courses")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};