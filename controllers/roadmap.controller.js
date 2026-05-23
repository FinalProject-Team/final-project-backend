import { supabaseAdmin } from "../config/supabase.js";

export const getRoadmap = async (req, res) => {

    try {

        const userId = req.user.id;

        // 1) get all tracks
        const { data: tracks, error: tracksError } =
            await supabaseAdmin
                .from("tracks")
                .select("*");

        if (tracksError) {
            return res.status(400).json({
                error: tracksError.message
            });
        }

        // 2) get all courses
        const { data: courses } = await supabaseAdmin
            .from("courses")
            .select("*");

        // 3) get all lessons
        const { data: lessons } = await supabaseAdmin
            .from("lessons")
            .select("id, course_id");

        // 4) get completed lessons
        const { data: progress } = await supabaseAdmin
            .from("lesson_progress")
            .select("lesson_id")
            .eq("user_id", userId)
            .eq("is_completed", true);

        const completedLessonIds =
            progress?.map(p => p.lesson_id) || [];

        // roadmap result
        const roadmap = tracks.map(track => {

            // courses for this track
            const trackCourses = courses.filter(
                course => course.track_id === track.id
            );

            const formattedCourses = trackCourses.map(course => {

                // lessons for this course
                const courseLessons = lessons.filter(
                    lesson => lesson.course_id === course.id
                );

                const totalLessons =
                    courseLessons.length;

                const completedLessons =
                    courseLessons.filter(
                        lesson =>
                            completedLessonIds.includes(
                                lesson.id
                            )
                    ).length;

                const progressPercentage =
                    totalLessons === 0
                        ? 0
                        : Math.round(
                            (completedLessons / totalLessons) * 100
                        );

                return {

                    course_id: course.id,

                    title: course.title,

                    total_lessons: totalLessons,

                    completed_lessons:
                        completedLessons,

                    progress: progressPercentage,

                    status:
                        progressPercentage === 100
                            ? "completed"
                            : progressPercentage > 0
                                ? "in_progress"
                                : "not_started",

                    xp:
                        completedLessons * 50
                };

            });

            // better track progress
            const totalProgress =
                formattedCourses.reduce(
                    (sum, course) =>
                        sum + course.progress,
                    0
                );

            const trackProgress =
                formattedCourses.length === 0
                    ? 0
                    : Math.round(
                        totalProgress /
                        formattedCourses.length
                    );

            return {

                track_id: track.id,

                track_title: track.title,

                track_progress: trackProgress,

                courses: formattedCourses
            };

        });

        res.status(200).json({
            success: true,
            roadmap
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};