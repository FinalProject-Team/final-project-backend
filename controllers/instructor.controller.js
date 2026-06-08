import supabase from "../config/supabase.js";

// export const getInstructorDashboard = async (req, res) => {
//     try {
//         const instructorId = req.profile.id;

//         // 1. Get instructor courses
//         const { data: courses, error: coursesError } = await supabase
//             .from("courses")
//             .select("id")
//             .eq("instructor_id", instructorId);

//         if (coursesError) throw coursesError;

//         const courseIds = courses.map(c => c.id);

//         // 2. Get lessons count
//         const { count: lessonsCount } = await supabase
//             .from("lessons")
//             .select("*", { count: "exact", head: true })
//             .in("course_id", courseIds);

//         // 3. Get enrollments count
//         const { count: studentsCount } = await supabase
//             .from("enrollments")
//             .select("*", { count: "exact", head: true })
//             .in("course_id", courseIds);

//         res.json({
//             totalCourses: courses.length,
//             totalLessons: lessonsCount || 0,
//             totalStudents: studentsCount || 0
//         });

//     } catch (err) {
//         res.status(500).json({
//             error: err.message
//         });
//     }
// };

// import supabase from "../config/supabase.js";

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

        // 2. Default values (important fix)
        let lessonsCount = 0;
        let studentsCount = 0;

        // 3. Only query if courses exist
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


export const getInstructorActivity = async (req, res) => {
    try {
        const instructorId = req.profile.id;

        // 1. Get instructor courses
        const { data: courses, error: coursesError } = await supabase
            .from("courses")
            .select("id, title, created_at")
            .eq("instructor_id", instructorId);

        if (coursesError) throw coursesError;

        const courseIds = courses.map(c => c.id);

        let activities = [];

        // 2. Course created activity
        courses.forEach(course => {
            activities.push({
                type: "course",
                message: `New course created: ${course.title}`,
                created_at: course.created_at
            });
        });

        if (courseIds.length > 0) {

            // 3. Lessons activity
            const { data: lessons } = await supabase
                .from("lessons")
                .select("title, created_at, course_id")
                .in("course_id", courseIds);

            lessons?.forEach(lesson => {
                activities.push({
                    type: "lesson",
                    message: `New lesson added: ${lesson.title}`,
                    created_at: lesson.created_at
                });
            });

            // 4. Enrollments activity
            const { data: enrollments } = await supabase
                .from("enrollments")
                .select("created_at, course_id")
                .in("course_id", courseIds);

            enrollments?.forEach(enroll => {
                activities.push({
                    type: "enrollment",
                    message: `A student enrolled in a course`,
                    created_at: enroll.created_at
                });
            });
        }

        // 5. Sort by newest first
        activities.sort((a, b) =>
            new Date(b.created_at) - new Date(a.created_at)
        );

        // 6. return latest 10 only
        return res.json(activities.slice(0, 10));

    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
};