// import supabase from "../config/supabase.js";
import supabase, { supabaseAdmin } from "../config/supabase.js";

export const completeLesson = async (req, res) => {
    try {

        const { id } = req.params;
        const userId = req.user.id;

        // get lesson (to know course_id)
        const { data: lesson } = await supabaseAdmin
            .from("lessons")
            .select("course_id")
            .eq("id", id)
            .single();

        if (!lesson) {
            return res.status(404).json({
                error: "Lesson not found"
            });
        }

        // check enrollment
        const { data: enrollment } = await supabaseAdmin
            .from("enrollments")
            .select("*")
            .eq("user_id", userId)
            .eq("course_id", lesson.course_id)
            .maybeSingle();

        if (!enrollment) {
            return res.status(403).json({
                error: "You must enroll first"
            });
        }

        // check existing progress
        const { data: existingProgress } = await supabaseAdmin
            .from("lesson_progress")
            .select("*")
            .eq("user_id", userId)
            .eq("lesson_id", id)
            .maybeSingle();

        const alreadyCompleted = existingProgress?.is_completed;

        // upsert progress
        const { data, error } = await supabaseAdmin
            .from("lesson_progress")
            .upsert(
                [
                    {
                        user_id: userId,
                        lesson_id: id,
                        is_completed: true
                    }
                ],
                { onConflict: "user_id,lesson_id" }
            )
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // XP only first time
        if (!alreadyCompleted) {

            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("xp_points, weekly_xp")
                .eq("id", userId)
                .single();

            await supabaseAdmin
                .from("profiles")
                .update({
                    xp_points: (profile?.xp_points || 0) + 50,
                    weekly_xp: (profile?.weekly_xp || 0) + 50
                })
                .eq("id", userId);

        }

        res.status(200).json({
            message: "Lesson completed",
            progress: data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

export const getMyProgress = async (req, res) => {

    console.log("USER:", req.user.id);

    try {

        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from("lesson_progress")
            .select("*")
            .eq("user_id", userId);

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

export const getDashboardStats = async (req, res) => {
    try {

        const userId = req.user.id;

        // 1. courses
        const { data: enrollments } = await supabaseAdmin
            .from("enrollments")
            .select(`
                course_id,
                courses (
                    id,
                    title
                )
            `)
            .eq("user_id", userId);

        const courses = enrollments.map(e => e.courses);

        // 2. lessons
        const { data: lessons } = await supabaseAdmin
            .from("lessons")
            .select("id, course_id");

        // 3. progress
        const { data: progress } = await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id, updated_at")
            .eq("user_id", userId)
            .eq("is_completed", true)
            .order("updated_at", { ascending: false });

        const completedLessonIds =
            progress?.map(p => p.lesson_id) || [];

        const result = courses.map(course => {

            const courseLessons = lessons.filter(
                l => l.course_id === course.id
            );

            const total = courseLessons.length;

            const completedLessons = courseLessons.filter(
                l => completedLessonIds.includes(l.id)
            );

            const completed = completedLessons.length;

            const lastLesson =
                completedLessons.length > 0
                    ? completedLessons[0].id
                    : null;

            return {
                course_id: course.id,
                course_title: course.title,
                total,
                completed,
                progress:
                    total === 0
                        ? 0
                        : Math.round((completed / total) * 100),
                last_lesson_id: lastLesson
            };

        });

        res.status(200).json(result);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

export const test = async (req, res) => {

    const { data } = await supabaseAdmin
        .from("enrollments")
        .select("*");

    res.json(data);

};

export const getContinueLearning = async (req, res) => {

    try {

        const userId = req.user.id;

        // آخر lesson خلصها المستخدم
        const { data: lastProgress } = await supabaseAdmin
            .from("lesson_progress")
            .select(`
                updated_at,
                lessons (
                    id,
                    title,
                    lesson_order,
                    course_id
                )
            `)
            .eq("user_id", userId)
            .eq("is_completed", true)
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

        if (!lastProgress) {
            return res.status(404).json({
                message: "No completed lessons yet"
            });
        }

        const lastLesson = lastProgress.lessons;

        // نجيب الكورس
        const { data: course } = await supabaseAdmin
            .from("courses")
            .select("id, title")
            .eq("id", lastLesson.course_id)
            .single();

        // نجيب الليسن اللي بعدها
        const { data: nextLesson } = await supabaseAdmin
            .from("lessons")
            .select("id, title, lesson_order")
            .eq("course_id", lastLesson.course_id)
            .eq("lesson_order", lastLesson.lesson_order + 1)
            .maybeSingle();

        // total lessons
        const { data: lessons } = await supabaseAdmin
            .from("lessons")
            .select("id")
            .eq("course_id", lastLesson.course_id);

        // completed lessons
        const { data: completedLessons } = await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("is_completed", true);

        const completedIds = completedLessons.map(
            l => l.lesson_id
        );

        const completedCount = lessons.filter(
            l => completedIds.includes(l.id)
        ).length;

        const progress = Math.round(
            (completedCount / lessons.length) * 100
        );

        res.status(200).json({
            course_id: course.id,
            course_title: course.title,
            last_completed_lesson: lastLesson,
            next_lesson: nextLesson,
            progress
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getRecentActivity = async (req, res) => {

    try {

        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from("lesson_progress")
            .select(`
                updated_at,
                lessons (
                    title
                )
            `)
            .eq("user_id", userId)
            .eq("is_completed", true)
            .order("updated_at", { ascending: false })
            .limit(5);

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        const activity = data.map(item => ({
            type: "lesson_completed",
            title: `Completed ${item.lessons.title}`,
            time: item.updated_at
        }));

        res.status(200).json(activity);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getDashboardSummary = async (req, res) => {

    try {

        const userId = req.user.id;

        // dashboard stats
        const { data: enrollments } = await supabaseAdmin
            .from("enrollments")
            .select(`
                course_id,
                courses (
                    id,
                    title
                )
            `)
            .eq("user_id", userId);

        const courses = enrollments.map(e => e.courses);

        const { data: lessons } = await supabaseAdmin
            .from("lessons")
            .select("id, course_id");

        const { data: progress } = await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("is_completed", true);

        const completedIds = progress.map(
            p => p.lesson_id
        );

        const stats = courses.map(course => {

            const courseLessons = lessons.filter(
                l => l.course_id === course.id
            );

            const total = courseLessons.length;

            const completed = courseLessons.filter(
                l => completedIds.includes(l.id)
            ).length;

            return {
                course_id: course.id,
                course_title: course.title,
                total,
                completed,
                progress:
                    total === 0
                        ? 0
                        : Math.round((completed / total) * 100)
            };

        });

        // continue learning
        const { data: lastProgress } = await supabaseAdmin
            .from("lesson_progress")
            .select(`
                updated_at,
                lessons (
                    id,
                    title,
                    lesson_order,
                    course_id
                )
            `)
            .eq("user_id", userId)
            .eq("is_completed", true)
            .order("updated_at", { ascending: false })
            .limit(1)
            .single();

        let continueLearning = null;

        if (lastProgress) {

            const lastLesson = lastProgress.lessons;

            const { data: course } = await supabaseAdmin
                .from("courses")
                .select("id, title")
                .eq("id", lastLesson.course_id)
                .single();

            const { data: nextLesson } = await supabaseAdmin
                .from("lessons")
                .select("id, title")
                .eq("course_id", lastLesson.course_id)
                .eq("lesson_order", lastLesson.lesson_order + 1)
                .maybeSingle();

            continueLearning = {
                course_id: course.id,
                course_title: course.title,
                last_completed_lesson: lastLesson,
                next_lesson: nextLesson
            };

        }

        // recent activity
        const { data: recent } = await supabaseAdmin
            .from("lesson_progress")
            .select(`
                updated_at,
                lessons (
                    title
                )
            `)
            .eq("user_id", userId)
            .eq("is_completed", true)
            .order("updated_at", { ascending: false })
            .limit(5);

        const recentActivity = recent.map(item => ({
            type: "lesson_completed",
            title: `Completed ${item.lessons.title}`,
            time: item.updated_at
        }));

        res.status(200).json({
            stats,
            continue_learning: continueLearning,
            recent_activity: recentActivity
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};


export const getProgressDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. profile
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("xp_points")
            .eq("id", userId)
            .single();

        // 2. courses progress (استخدمي اللي عندك)
        const { data: enrollments } = await supabaseAdmin
            .from("enrollments")
            .select(`course_id, courses(id, title)`)
            .eq("user_id", userId);

        const courses = enrollments.map(e => e.courses);

        const { data: lessons } = await supabaseAdmin
            .from("lessons")
            .select("id, course_id");

        const { data: progress } = await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("is_completed", true);

        const completedIds = progress.map(p => p.lesson_id);

        const progress_per_course = courses.map(course => {
            const courseLessons = lessons.filter(l => l.course_id === course.id);

            const total = courseLessons.length;
            const completed = courseLessons.filter(l =>
                completedIds.includes(l.id)
            ).length;

            return {
                title: course.title,
                progress: total ? Math.round((completed / total) * 100) : 0
            };
        });

        // 3. profile summary
        const result = {
            profile: {
                overall_progress: Math.round(
                    progress_per_course.reduce((a, b) => a + b.progress, 0) /
                    (progress_per_course.length || 1)
                ),
                current_streak: 7,
                total_xp_this_month: profile?.xp_points || 0,
                certificates_count: 0
            },

            xp_growth: [],

            course_completion: {
                completed: progress.filter(Boolean).length,
                in_progress: courses.length,
                not_started: 0
            },

            progress_per_course,

            daily_learning_hours: []
        };

        res.json(result);

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};