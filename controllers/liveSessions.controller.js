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
            scheduled_at
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
                }
            ])
            .select()
            .single();

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