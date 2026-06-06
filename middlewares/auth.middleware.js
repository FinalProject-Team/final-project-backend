
// import supabase from "../config/supabase.js";
import supabase, { supabaseAdmin } from "../config/supabase.js";
export const protect = async (req, res, next) => {

    try {

        const authHeader = req.headers.authorization;

        console.log("AUTH HEADER:", req.headers.authorization);
        if (!authHeader?.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Unauthorized"
            });
        }

        const token = authHeader.split(" ")[1];

        const { data, error } = await supabase.auth.getUser(token);

        console.log("USER:", data);
        console.log("ERROR:", error);

        if (error || !data?.user) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        // user
        req.user = data.user;

        // profile
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

        req.profile = profile;
        console.log("REQ PROFILE:", req.profile);

        next();

    } catch (err) {

        res.status(500).json({
            error: err.message
        });

    }

};