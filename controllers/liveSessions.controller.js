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
                    meeting_link: meeting_link || null,
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


export const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        // 1. get session
        const { data: session, error } = await supabaseAdmin
            .from("live_sessions")
            .select("instructor_id")
            .eq("id", id)
            .single();

        if (error || !session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        // 2. authorization check
        if (role !== "admin" && session.instructor_id !== userId) {
            return res.status(403).json({
                message: "Not allowed to delete this session"
            });
        }

        // 3. delete
        const { error: deleteError } = await supabaseAdmin
            .from("live_sessions")
            .delete()
            .eq("id", id);

        if (deleteError) {
            return res.status(400).json({
                message: deleteError.message
            });
        }

        return res.json({
            message: "Session deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};


export const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const role = req.user.role;

        const updates = req.body;

        // 1. get session
        const { data: session, error } = await supabaseAdmin
            .from("live_sessions")
            .select("instructor_id")
            .eq("id", id)
            .single();

        if (error || !session) {
            return res.status(404).json({
                message: "Session not found"
            });
        }

        // 2. authorization
        if (role !== "admin" && session.instructor_id !== userId) {
            return res.status(403).json({
                message: "Not allowed to update this session"
            });
        }

        // 3. update
        const { data, error: updateError } = await supabaseAdmin
            .from("live_sessions")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (updateError) {
            return res.status(400).json({
                message: updateError.message
            });
        }

        return res.json({
            message: "Session updated successfully",
            data
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message
        });
    }
};