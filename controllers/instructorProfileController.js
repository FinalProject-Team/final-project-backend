import supabase from "../config/supabase.js";

export const getMyInstructorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("REQ USER:", req.user);        // 👈 هنا
        console.log("USER ID:", req.user?.id);
        const { data, error } = await supabase
            .from("instructor_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        if (data) return res.json(data);

        const { data: newProfile, error: insertError } = await supabase
            .from("instructor_profiles")
            .insert({ id: userId })
            .select()
            .single();

        if (insertError) {
            return res.status(400).json({ error: insertError.message });
        }

        return res.json(newProfile);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};
export const updateInstructorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            bio,
            github,
            linkedin,
            website,
            location
        } = req.body;

        const updates = {};

        if (bio) updates.bio = bio;
        if (github) updates.github = github;
        if (linkedin) updates.linkedin = linkedin;
        if (website) updates.website = website;
        if (location) updates.location = location;

        const { error } = await supabase
            .from("instructor_profiles")
            .update(updates)
            .eq("id", userId);

        if (error) throw error;

        const { data } = await supabase
            .from("instructor_profiles")
            .select("*")
            .eq("id", userId)
            .single();

        return res.json({
            message: "Profile updated",
            data
        });

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};



export const getInstructorProfileById = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from("instructor_profiles")
            .select(`
                *,
                profiles(full_name, avatar_url, bio)
            `)
            .eq("id", id)
            .single();

        if (error) throw error;

        return res.json(data);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};