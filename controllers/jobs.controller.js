import { supabaseAdmin } from "../config/supabase.js";

export const getJobs = async (req, res) => {

    try {

        const { search, location, type } = req.query;

        let query = supabaseAdmin
            .from("jobs")
            .select("*")
            .order("created_at", { ascending: false });

        // search
        if (search) {
            query = query.ilike("title", `%${search}%`);
        }

        // location filter
        if (location) {
            query = query.ilike("location", `%${location}%`);
        }

        // job type filter
        if (type) {
            query = query.eq("job_type", type);
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

export const getSingleJob = async (req, res) => {

    try {

        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            return res.status(404).json({
                error: "Job not found"
            });
        }

        res.status(200).json(data);

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const applyToJob = async (req, res) => {

    try {

        const userId = req.user.id;

        const { id } = req.params;

        // check if job exists
        const { data: job } = await supabaseAdmin
            .from("jobs")
            .select("*")
            .eq("id", id)
            .single();

        if (!job) {
            return res.status(404).json({
                error: "Job not found"
            });
        }

        // prevent duplicate apply
        const { data: existingApplication } = await supabaseAdmin
            .from("job_applications")
            .select("*")
            .eq("user_id", userId)
            .eq("job_id", id)
            .maybeSingle();

        if (existingApplication) {
            return res.status(400).json({
                error: "Already applied"
            });
        }

        const { data, error } = await supabaseAdmin
            .from("job_applications")
            .insert([
                {
                    user_id: userId,
                    job_id: id
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
            message: "Applied successfully",
            application: data
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getMyApplications = async (req, res) => {

    try {

        const userId = req.user.id;

        const { data, error } = await supabaseAdmin
            .from("job_applications")
            .select(`
                id,
                status,
                created_at,
                jobs (
                    id,
                    title,
                    company,
                    location,
                    salary,
                    job_type
                )
            `)
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

