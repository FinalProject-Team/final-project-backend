import supabase, { supabaseAdmin } from "../config/supabase.js";

export const register = async (req, res) => {
    try {

        const { email, password, full_name, phone, confirmPassword } = req.body;

        if (!email || !password || !full_name || !phone || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        // check passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        // create auth user
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert([
                {
                    id: data.user.id,
                    full_name,
                    phone
                }
            ]);

        if (profileError) {
            return res.status(400).json({
                error: profileError.message
            });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: data.user
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};


export const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json({
            message: "Login successful",
            data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const googleLogin = async (req, res) => {
    try {
        const { user } = req.body;

        if (!user) {
            return res.status(400).json({
                message: "User object is required",
            });
        }

        const { id, email, user_metadata } = user;

        if (!id || !email) {
            return res.status(400).json({
                message: "Invalid Supabase user",
            });
        }

        // check if exists
        const { data: existing } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        // create if not exists
        if (!existing) {
            const { error } = await supabase.from("profiles").insert([
                {
                    id, // 👈 UUID من Supabase
                    email,
                    full_name: user_metadata?.full_name || "No Name",
                    avatar_url: user_metadata?.avatar_url || "",
                    role: "user",
                },
            ]);

            if (error) {
                return res.status(400).json({
                    message: "Insert failed",
                    error: error.message,
                });
            }
        }

        // return final user
        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        return res.status(200).json({
            message: "User synced successfully",
            user: profile,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
}; 

export const getMe = async (req, res) => {

    try {

        const userId = req.user.id;

        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json({
            profile: data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const updateProfile = async (req, res) => {
    try {

        const userId = req.user.id || req.user.sub;

        const {
            full_name,
            bio,
            job_title,
            portfolio,
            username,
            headline,
            avatar_url
        } = req.body;

        const updates = {};

        if (full_name) updates.full_name = full_name;
        if (bio) updates.bio = bio;
        if (job_title) updates.job_title = job_title;
        if (portfolio) updates.portfolio = portfolio;
        if (username) updates.username = username;
        if (headline) updates.headline = headline;
        if (avatar_url) updates.avatar_url = avatar_url;

        const { error } = await supabase
            .from("profiles")
            .update(updates)
            .eq("id", userId);

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        return res.status(200).json({
            message: "Profile updated successfully",
            profile: data
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};