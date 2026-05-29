import { supabaseAdmin } from "../config/supabase.js";

/* =========================================
   GET ALL PROJECTS
========================================= */
export const getProjects = async (req, res) => {
    try {
        const { search, status, category } = req.query;

        let query = supabaseAdmin
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false });

        // search
        if (search) {
            query = query.ilike("title", `%${search}%`);
        }

        // filter status
        if (status) {
            query = query.eq("status", status);
        }

        // filter category
        if (category) {
            query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* =========================================
   CREATE PROJECT + NOTIFICATION
========================================= */
export const createProject = async (req, res) => {
    try {
        const userId = req.user.id;

        const {
            title,
            description,
            github_link,
            live_demo,
            status,
            completion_percentage,
            image_url,
            technologies,
            category,
            stars,
        } = req.body;

        const { data, error } = await supabaseAdmin
            .from("projects")
            .insert([
                {
                    user_id: userId,
                    title,
                    description,
                    github_link,
                    live_demo,
                    status,
                    completion_percentage,
                    image_url,
                    technologies,
                    category,
                    stars,
                },
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        //  Notification - Project Created
        await supabaseAdmin.from("notifications").insert([
            {
                user_id: userId,
                title: "Project Created",
                message: `Your project "${title}" has been created successfully`,
                type: "project_created",
                read: false,
            },
        ]);

        res.status(201).json({
            message: "Project created successfully",
            project: data,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* =========================================
   GET MY PROJECTS
========================================= */
export const getMyProjects = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* =========================================
   GET SINGLE PROJECT
========================================= */
export const getSingleProject = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* =========================================
   UPDATE PROJECT + NOTIFICATION
========================================= */
export const updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const {
            title,
            description,
            github_link,
            live_demo,
            status,
            completion_percentage,
            image_url,
            technologies,
            category,
            stars,
        } = req.body;

        // check ownership
        const { data: existingProject } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (!existingProject) {
            return res
                .status(404)
                .json({ error: "Project not found or unauthorized" });
        }

        const { data, error } = await supabaseAdmin
            .from("projects")
            .update({
                title,
                description,
                github_link,
                live_demo,
                status,
                completion_percentage,
                image_url,
                technologies,
                category,
                stars,
            })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        //  Notification - Project Updated
        await supabaseAdmin.from("notifications").insert([
            {
                user_id: userId,
                title: "Project Updated",
                message: `Your project "${data.title}" has been updated successfully`,
                type: "project_updated",
                read: false,
            },
        ]);

        res.status(200).json({
            message: "Project updated successfully",
            project: data,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/* =========================================
   DELETE PROJECT
   (بدون notification - اختياري)
========================================= */
export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // check ownership
        const { data: existingProject } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("id", id)
            .eq("user_id", userId)
            .single();

        if (!existingProject) {
            return res
                .status(404)
                .json({ error: "Project not found or unauthorized" });
        }

        const { error } = await supabaseAdmin
            .from("projects")
            .delete()
            .eq("id", id);

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: "Project deleted successfully",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};