import supabase from "../config/supabase.js";

export const fetchCourses = async () => {

    const { data, error } = await supabase
        .from("courses")
        .select(`
            *,
            tracks (
                title
            )
        `);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};