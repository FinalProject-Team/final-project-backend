import supabase from "../config/supabase.js";
import { supabaseAdmin } from "../config/supabase.js";

/**
 * Create Live Session
 */
export const createSession = async (req, res) => {
    try {
        const {
            course_id,
            title,
            description,
            meeting_link,
            scheduled_at,
            session_type
        } = req.body;

        const instructor_id = req.user.id;

        // Create session (ADMIN CLIENT)
        const { data, error } = await supabaseAdmin
            .from("live_sessions")
            .insert([
                {
                    course_id,
                    instructor_id,
                    title,
                    description,
                    meeting_link,
                    scheduled_at,
                    session_type
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        // Get students enrolled in course (PUBLIC READ)
        const { data: students } = await supabaseAdmin
            .from("enrollments")
            .select("user_id")
            .eq("course_id", course_id);

        // Send notifications (ADMIN WRITE)
        if (students && students.length > 0) {
            const notifications = students.map((student) => ({
                user_id: student.user_id,
                title: "New Live Session",
                message: `${title} is scheduled at ${scheduled_at}`,
                type: "live_session",
                related_id: data.id
            }));

            await supabaseAdmin
                .from("notifications")
                .insert(notifications);
        }

        return res.status(201).json({
            message: "Live session created successfully",
            data
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Get All Sessions
 */
export const getSessions = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("live_sessions")
            .select("*")
            .order("scheduled_at", { ascending: true });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.json({ data });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Get Single Session
 */
export const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("live_sessions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.json({ data });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Get My Live Sessions (Student)
 */
export const getMyLiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get enrolled courses
        const { data: enrollments, error: enrollError } = await supabaseAdmin
            .from("enrollments")
            .select("course_id")
            .eq("user_id", userId);

        if (enrollError) {
            return res.status(400).json({
                message: enrollError.message
            });
        }

        if (!enrollments || enrollments.length === 0) {
            return res.json({ data: [] });
        }

        const courseIds = enrollments.map(e => e.course_id);

        // Get sessions for enrolled courses
        const { data, error } = await supabase
            .from("live_sessions")
            .select("*")
            .in("course_id", courseIds)
            .order("scheduled_at", { ascending: true });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        return res.json({ data });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};