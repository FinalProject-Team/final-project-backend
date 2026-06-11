import { supabaseAdmin } from "../config/supabase.js";

export const sendMessage = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { content } = req.body;

        console.log("chatId:", chatId);
        console.log("content:", content);

        const { data, error } = await supabaseAdmin
            .from("chat_messages")
            .insert([
                {
                    role: "user",
                    content,
                },
            ])
            .select();

        console.log("DATA:", data);
        console.log("ERROR:", error);

        if (error) {
            return res.status(400).json({
                message: "DB error",
                error: error.message,
            });
        }

        return res.status(201).json(data);
    } catch (err) {
        console.log("CATCH ERROR:", err);
        return res.status(500).json({
            message: "Failed to send message",
            error: err.message,
        });
    }
};

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