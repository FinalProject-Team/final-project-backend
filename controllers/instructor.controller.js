import supabase from "../config/supabase.js";

/* =========================
   DASHBOARD
========================= */
export const getInstructorDashboard = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        if (!instructorId) {
            return res.status(403).json({ error: "No instructor profile found" });
        }

        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("id")
            .eq("instructor_id", instructorId);

        if (coursesError) throw coursesError;

        const courseIds = courses?.map(c => c.id) || [];

        let lessonsCount = 0;
        let studentsCount = 0;

        if (courseIds.length > 0) {
            const { count: lCount, error: lessonsError } = await supabase
                .from("lessons")
                .select("*", { count: "exact", head: true })
                .in("course_id", courseIds);

            if (lessonsError) throw lessonsError;

            const { count: sCount, error: studentsError } = await supabase
                .from("enrollments")
                .select("*", { count: "exact", head: true })
                .in("course_id", courseIds);

            if (studentsError) throw studentsError;

            lessonsCount = lCount || 0;
            studentsCount = sCount || 0;
        }

        return res.json({
            totalCourses: courses.length,
            totalLessons: lessonsCount,
            totalStudents: studentsCount
        });

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

/* =========================
   GET COURSES
========================= */
export const getInstructorCourses = async (req, res) => {
    try {
        const instructorId = req.profile?.id;

        if (!instructorId) {
            return res.status(403).json({ error: "No instructor profile found" });
        }

        const { data: courses, error } = await supabase
            .from("courses")
            .select("*")
            .eq("instructor_id", instructorId);

        if (error) throw error;

        return res.json(courses || []);

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};

/* =========================
   COURSES SUMMARY
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

        const summary = (courses || []).map(course => {
            const count = safeLessons.filter(
                l => l.course_id === course.id
            ).length;

            return {
                ...course,
                totalLessons: count
            };
        });

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

        safeCourses.forEach(course => {
            activities.push({
                type: "course",
                message: `New course created: ${course.title}`,
                created_at: course.created_at
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

            lessons?.forEach(lesson => {
                activities.push({
                    type: "lesson",
                    message: `New lesson added: ${lesson.title}`,
                    created_at: lesson.created_at
                });
            });

            enrollments?.forEach(enroll => {
                activities.push({
                    type: "enrollment",
                    message: `A student enrolled in a course`,
                    created_at: enroll.created_at
                });
            });
        }

        activities.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
        );

        return res.json(activities.slice(0, 10));

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};