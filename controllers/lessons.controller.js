import supabase from "../config/supabase.js";

export const getCourseLessons = async (req, res) => {

    try {

        const { id } = req.params;

        console.log("COURSE ID:", id);

        const { data, error } = await supabase
            .from("lessons")
            .select("*")
            .eq("course_id", `${id}`);

        console.log("LESSONS:", data);
        console.log("ERROR:", error);

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