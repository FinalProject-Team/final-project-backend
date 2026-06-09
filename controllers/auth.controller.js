import supabase, { supabaseAdmin } from "../config/supabase.js";

/* ───────────────────────── REGISTER ───────────────────────── */

export const register = async (req, res) => {
    try {
        const {
            email,
            password,
            full_name,
            phone,
            confirmPassword,
            role = "student"
        } = req.body;

        if (!email || !password || !full_name || !phone || !confirmPassword) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

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

        // create profile
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert([
                {
                    id: data.user.id,
                    full_name,
                    phone,
                    role,
                    email: data.user.email
                }
            ]);

        if (profileError) {
            return res.status(400).json({
                error: profileError.message
            });
        }

        // optional instructor profile
        if (role === "instructor") {
            await createInstructorProfile(data.user.id);
        }

        return res.status(201).json({
            message: "User registered successfully",
            user: data.user
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};

const createInstructorProfile = async (userId) => {
    const { error } = await supabaseAdmin
        .from("instructor_profiles")
        .insert([{ id: userId }]);

    if (error) {
        console.log("Instructor profile error:", error.message);
    }
};


/* ───────────────────────── LOGIN ───────────────────────── */

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

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

        return res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    ...data.user,
                    role: profile?.role || "student",
                    profile
                },
                session: data.session
            }
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


/* ───────────────────────── GOOGLE LOGIN ───────────────────────── */

export const googleLogin = async (req, res) => {
    try {
        const { user } = req.body;

        if (!user) {
            return res.status(400).json({
                message: "User object is required"
            });
        }

        const { id, email, user_metadata } = user;

        if (!id || !email) {
            return res.status(400).json({
                message: "Invalid user data"
            });
        }

        const { data: existing } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (!existing) {
            const { error } = await supabase.from("profiles").insert([
                {
                    id,
                    email,
                    full_name: user_metadata?.full_name || "No Name",
                    avatar_url: user_metadata?.avatar_url || "",
                    role: "student"
                }
            ]);

            if (error) {
                return res.status(400).json({
                    error: error.message
                });
            }
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        return res.status(200).json({
            message: "User synced successfully",
            data: {
                user: {
                    ...profile,
                    role: profile?.role || "student"
                },
                session: null
            }
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


/* ───────────────────────── GET ME ───────────────────────── */

export const getMe = async (req, res) => {
    try {
        const userId = req.profile?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

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

        return res.status(200).json({
            user: data
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


/* ───────────────────────── UPDATE PROFILE ───────────────────────── */

export const updateProfile = async (req, res) => {
    try {
        const userId = req.profile?.id;

        if (!userId) {
            return res.status(401).json({
                error: "Unauthorized"
            });
        }

        const updates = req.body;

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