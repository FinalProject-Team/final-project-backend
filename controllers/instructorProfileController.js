import supabase from "../config/supabase.js";

export const getMyInstructorProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        console.log("REQ USER:", req.user);
        console.log("USER ID:", req.user?.id);

        // 1️ get instructor profile
        const { data, error } = await supabase
            .from("instructor_profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        // 2️ create profile if not exists
        let profile = data;

        if (!profile) {
            const { data: newProfile, error: insertError } = await supabase
                .from("instructor_profiles")
                .insert([{ id: userId }])
                .select()
                .single();

            if (insertError) {
                return res.status(400).json({ error: insertError.message });
            }

            profile = newProfile;
        }

        // 3️ get courses count
        const { count: coursesCount } = await supabase
            .from("courses")
            .select("*", { count: "exact", head: true })
            .eq("instructor_id", userId);

        // 4️ get course ids
        const { data: courses } = await supabase
            .from("courses")
            .select("id")
            .eq("instructor_id", userId);

        const courseIds = courses?.map(c => c.id) || [];

        // 5️ get lessons count
        let lessonsCount = 0;

        if (courseIds.length > 0) {
            const { count } = await supabase
                .from("lessons")
                .select("*", { count: "exact", head: true })
                .in("course_id", courseIds);

            lessonsCount = count || 0;
        }

        // 6️ final response
        return res.json({
            ...profile,
            courses_count: coursesCount || 0,
            lessons_count: lessonsCount
        });

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