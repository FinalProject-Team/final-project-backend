import supabase, { supabaseAdmin } from "../config/supabase.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        if (error || !data?.user) {
            return res.status(401).json({ message: "Invalid token" });
        }

        req.user = data.user;

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

        req.profile = profile;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
            error: err.message,
        });
    }
};