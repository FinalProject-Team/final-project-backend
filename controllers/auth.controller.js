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
        } = req.body;

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
                    phone,
                    role: "student" // ✅ default role
                }
            ]);

        if (role === "instructor") {
            await createInstructorProfile(data.user.id);
        }

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


const createInstructorProfile = async (userId) => {
    const { error } = await supabaseAdmin
        .from("instructor_profiles")
        .insert([
            {
                id: userId
            }
        ]);

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

        // 1️⃣ LOGIN FROM SUPABASE AUTH
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // 2️⃣ GET PROFILE (ROLE) FROM DATABASE
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .maybeSingle();

        if (profileError) {
            console.log("Profile fetch error:", profileError.message);
        }

        // 3️⃣ RESPONSE (IMPORTANT PART)
        return res.status(200).json({
            message: "Login successful",
            data: {
                user: {
                    ...data.user,
                    role: profile?.role || "student",   // ✅ REAL ROLE
                    profile: profile || null
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
                message: "User object is required",
            });
        }

        const { id, email, user_metadata } = user;

        if (!id || !email) {
            return res.status(400).json({
                message: "Invalid Supabase user",
            });
        }

        // 1️⃣ check if profile exists
        const { data: existing } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        // 2️⃣ create if not exists
        if (!existing) {
            const { error } = await supabase.from("profiles").insert([
                {
                    id,
                    email,
                    full_name: user_metadata?.full_name || "No Name",
                    avatar_url: user_metadata?.avatar_url || "",
                    role: "student"
                },
            ]);

            if (error) {
                return res.status(400).json({
                    message: "Insert failed",
                    error: error.message,
                });
            }
        }

        // 3️⃣ get final profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", id)
            .maybeSingle();

        if (profileError) {
            console.log("Profile fetch error:", profileError.message);
        }

        // 4️⃣ IMPORTANT: get session from Supabase user
        const { data: sessionData, error: sessionError } =
            await supabase.auth.admin.getUserById(id);

        // (fallback if session not needed)
        const session = null;

        // 5️⃣ RETURN SAME FORMAT AS LOGIN
        return res.status(200).json({
            message: "User synced successfully",
            data: {
                user: {
                    ...profile,
                    role: profile?.role || "student"
                },
                session
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message,
        });
    }
};

/* ───────────────────────── GET ME ───────────────────────── */

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

        return res.status(200).json({
            user: data   // ✅ unified format
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
};

/* ───────────────────────── UPDATE PROFILE ───────────────────────── */

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