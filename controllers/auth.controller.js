import supabase, { supabaseAdmin } from "../config/supabase.js";

export const register = async (req, res) => {
    try {

        const { email, password, full_name } = req.body;

        if (!email || !password || !full_name) {
            return res.status(400).json({
                message: "All fields are required"
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
        // const { error: profileError } = await supabase
        //     .from("profiles")
        //     .insert([
        //         {
        //             id: data.user.id,
        //             full_name
        //         }
        //     ]);
        const { error: profileError } = await supabaseAdmin
            .from("profiles")
            .insert([
                {
                    id: data.user.id,
                    full_name
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

        const userId = req.user.id;

        const {
            full_name,
            bio,
            job_title,
            portfolio,
            username,
            headline,
            avatar_url
        } = req.body;

        const { error } = await supabase
            .from("profiles")
            .update({
                full_name,
                bio,
                job_title,
                portfolio,
                username,
                headline,
                avatar_url
            })
            .eq("id", userId);

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // 👇 أهم سطر (نجيب الداتا بعد التحديث)
        const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        console.log("PROFILE AFTER UPDATE:", data);

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