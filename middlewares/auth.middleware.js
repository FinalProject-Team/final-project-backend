import jwt from "jsonwebtoken";
import { supabaseAdmin } from "../config/supabase.js";

export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded;

        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", decoded.id)
            .single();

        if (error || !profile) {
            return res.status(403).json({ message: "Profile not found" });
        }

        req.profile = profile;

        next();
    } catch (err) {
        return res.status(401).json({
            message: "Unauthorized",
            error: err.message,
        });
    }
};