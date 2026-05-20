import { supabaseAdmin } from "../config/supabase.js";

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
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

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
            stars
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
                    stars
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(201).json({
            message: "Project created successfully",
            project: data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

export const getMyProjects = async (req, res) => {
    try {

        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};

export const getSingleProject = async (req, res) => {
    try {

        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("projects")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json({
                error: "Project not found"
            });
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }
};