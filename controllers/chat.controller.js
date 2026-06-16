import { supabaseAdmin } from "../config/supabase.js";


// =========================
// 📩 SEND MESSAGE
// =========================
export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { message } = req.body;

        const senderId = req.profile.id;

        const { data, error } = await supabaseAdmin
            .from("chat_messages")
            .insert([
                {
                    chat_id: chatId,
                    sender_id: senderId,
                    message: message,
                },
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                message: "DB error",
                error: error.message,
            });
        }

        return res.status(201).json(data);
    } catch (err) {
        return res.status(500).json({
            message: "Failed to send message",
            error: err.message,
        });
    }
};


// =========================
// 📩 GET MESSAGES (Chat screen)
// =========================
export const getMessages = async (req, res) => {
    const { chatId } = req.params;

    const { data, error } = await supabaseAdmin
        .from("chat_messages")
        .select("*")
        .eq("chat_id", chatId)
        .order("created_at", { ascending: true });

    if (error) {
        return res.status(500).json({ message: "Failed to fetch messages" });
    }

    return res.json(data);
};


// =========================
// 💬 GET CHATS (Inbox)
// =========================
export const getChats = async (req, res) => {
    try {
        const userId = req.profile.id;

        const { data, error } = await supabaseAdmin
            .from("chats")
            .select("*")
            .or(`employer_id.eq.${userId},user_id.eq.${userId}`);

        if (error) {
            return res.status(500).json({
                message: "Failed to fetch chats",
                error: error.message,
            });
        }

        return res.json(data);
    } catch (err) {
        return res.status(500).json({
            message: "Server error",
            error: err.message,
        });
    }
};




