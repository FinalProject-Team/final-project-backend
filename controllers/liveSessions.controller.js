import supabase from "../config/supabase.js";

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

        const { data, error } = await supabase
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


        // get student 
        const { data: students } = await supabase
            .from("enrollments")
            .select("user_id")
            .eq("course_id", course_id);


        // Send Notification To Student 
        if (students && students.length > 0) {

            const notifications = students.map((student) => ({
                user_id: student.user_id,
                title: "New Live Session",
                message: `${title} is scheduled at ${scheduled_at}`,
                type: "live_session",
                related_id: data.id
            }));

            await supabase.from("notifications").insert(notifications);
        }

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.status(201).json({
            message: "Live session created",
            data
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

/**
 * Get All Sessions
 */
export const getSessions = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("live_sessions")
            .select("*")
            .order("scheduled_at", { ascending: true });

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.json({ data });

    } catch (error) {
        res.status(500).json({
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

        const { data, error } = await supabase
            .from("live_sessions")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message
            });
        }

        res.json({ data });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

// GET User LiveSessions
export const getMyLiveSessions = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1️⃣ Get enrolled courses for this student
        const { data: enrollments, error: enrollError } = await supabase
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

        // 2️⃣ Get live sessions for these courses
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

        res.json({
            data
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};