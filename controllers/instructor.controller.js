import supabase from "../config/supabase.js";

export const getInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.profile.id;

        // 1. Get instructor courses
        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("id")
            .eq("instructor_id", instructorId);

        if (coursesError) throw coursesError;

        const courseIds = courses.map(c => c.id);

        // 2. Get lessons count
        const { count: lessonsCount } = await supabase
            .from("lessons")
            .select("*", { count: "exact", head: true })
            .in("course_id", courseIds);

        // 3. Get enrollments count
        const { count: studentsCount } = await supabase
            .from("enrollments")
            .select("*", { count: "exact", head: true })
            .in("course_id", courseIds);

        res.json({
            totalCourses: courses.length,
            totalLessons: lessonsCount || 0,
            totalStudents: studentsCount || 0
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};



export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.profile.id;

        const { data, error } = await supabase
            .from("courses")
            .select("id, title, price, created_at")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        res.json(data);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


export const getInstructorCoursesSummary = async (req, res) => {
    try {
        const instructorId = req.profile.id;

        const { data: courses, error } = await supabase
            .from("courses")
            .select("id, title")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        const { data: lessons } = await supabase
            .from("lessons")
            .select("course_id");

        const summary = courses.map(course => {
            const count = lessons.filter(
                l => l.course_id === course.id
            ).length;

            return {
                ...course,
                totalLessons: count
            };
        });

        res.json(summary);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};