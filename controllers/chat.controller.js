import { supabaseAdmin } from "../config/supabase.js";

export const sendMessage = async (req, res) => {
    const { chatId } = req.params;
    const { message } = req.body;

    const senderId = req.profile.id;

    const { data, error } = await supabaseAdmin
        .from("chat_messages")
        .insert([
            {
                chat_id: chatId,
                sender_id: senderId,
                message,
            },
        ])
        .select()
        .single();

    if (error) {
        return res.status(500).json({ message: "Failed to send message" });
    }

    return res.status(201).json(data);
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