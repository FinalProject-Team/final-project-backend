import { supabase } from "../config/supabase.js";

/* =========================
   DASHBOARD
========================= */
export const getInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        if (!instructorId) {
            return res.status(403).json({ error: "Missing instructor profile" });
        }

        const { data: courses, error } = await supabase
            .from("courses")
            .select("id")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        const courseIds = courses?.map(c => c.id) || [];

        let lessonsCount = 0;
        let studentsCount = 0;

        if (courseIds.length > 0) {
            const { count: lCount } = await supabase
                .from("lessons")
                .select("*", { count: "exact", head: true })
                .in("course_id", courseIds);

            const { count: sCount } = await supabase
                .from("enrollments")
                .select("*", { count: "exact", head: true })
                .in("course_id", courseIds);

            lessonsCount = lCount || 0;
            studentsCount = sCount || 0;
        }

        return res.json({
            totalCourses: courses?.length || 0,
            totalLessons: lessonsCount,
            totalStudents: studentsCount
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/* =========================
   COURSES
========================= */
export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        if (!instructorId) {
            return res.status(403).json({ error: "Missing instructor profile" });
        }

        const { data, error } = await supabase
            .from("courses")
            .select("*")
            .eq("instructor_id", instructorId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return res.json(data || []);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/* =========================
   SUMMARY
========================= */
export const getInstructorCoursesSummary = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        const { data: courses, error } = await supabase
            .from("courses")
            .select("id, title")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        const { data: lessons } = await supabase
            .from("lessons")
            .select("course_id");

        const safeLessons = lessons || [];

        const summary = (courses || []).map(course => ({
            ...course,
            totalLessons: safeLessons.filter(l => l.course_id === course.id).length
        }));

        return res.json(summary);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

/* =========================
   ACTIVITY
========================= */
export const getInstructorActivity = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        const { data: courses, error } = await supabase
            .from("courses")
            .select("id, title, created_at")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        const safeCourses = courses || [];
        const courseIds = safeCourses.map(c => c.id);

        let activities = [];

        safeCourses.forEach(c => {
            activities.push({
                type: "course",
                message: `New course created: ${c.title}`,
                created_at: c.created_at
            });
        });

        if (courseIds.length > 0) {
            const { data: lessons } = await supabase
                .from("lessons")
                .select("title, created_at, course_id")
                .in("course_id", courseIds);

            const { data: enrollments } = await supabase
                .from("enrollments")
                .select("created_at, course_id")
                .in("course_id", courseIds);

            lessons?.forEach(l => activities.push({
                type: "lesson",
                message: `New lesson added: ${l.title}`,
                created_at: l.created_at
            }));

            enrollments?.forEach(e => activities.push({
                type: "enrollment",
                message: "A student enrolled in a course",
                created_at: e.created_at
            }));
        }

        activities.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        return res.json(activities.slice(0, 10));

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};


/* =========================
   LIVE SESSIONS
========================= */
export const getInstructorLiveSessions = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        if (!instructorId) {
            return res.status(403).json({ error: "Missing instructor profile" });
        }

        const { data, error } = await supabase
            .from("live_sessions")
            .select("*")
            .eq("instructor_id", instructorId)
            .order("created_at", { ascending: false });

        if (error) throw error;

        return res.json({
            message: "Instructor live sessions fetched successfully",
            data
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};