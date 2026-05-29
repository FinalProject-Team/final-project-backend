import supabase from "../config/supabase.js";

/* =========================================
   GET MY NOTIFICATIONS
========================================= */
export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.json({
            data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

/* =========================================
   MARK SINGLE NOTIFICATION AS READ
========================================= */
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const { data, error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("id", id)
            .eq("user_id", userId) // 🔥 security fix
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.json({
            message: "Notification marked as read",
            data,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

/* =========================================
   MARK ALL AS READ
========================================= */
export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;

        const { error } = await supabase
            .from("notifications")
            .update({ is_read: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.json({
            message: "All notifications marked as read",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

/* =========================================
   GET UNREAD COUNT (🔔 BADGE)
========================================= */
export const getUnreadCount = async (req, res) => {
    try {
        const userId = req.user.id;

        const { count, error } = await supabase
            .from("notifications")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("is_read", false);

        if (error) {
            return res.status(400).json({
                message: error.message,
            });
        }

        res.json({
            unread: count,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};