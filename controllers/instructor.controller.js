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