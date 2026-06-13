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

        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

        if (!profile) {
            return res.status(403).json({
                message: "User profile not found - please complete signup"
            });
        }

        // unified user object (single source for RBAC)
        req.user = {
            id: data.user.id,
            email: data.user.email,
            role: profile.role,
            has_paid: profile.has_paid
        };

        // optional full profile access if needed
        req.profile = profile;

        next();

    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
            error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
    }
};