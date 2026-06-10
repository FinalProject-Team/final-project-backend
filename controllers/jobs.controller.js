import { supabase } from "../config/supabase.js";


// ========================
// GET ALL JOBS
// ========================
export const getJobs = async (req, res) => {
    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    res.json(data);
};


// ========================
// CREATE JOB
// ========================
export const createJob = async (req, res) => {
    
    const userId = req.profile.id;



    const {
        title,
        company,
        location,
        salary,
        description,
        job_type,
        skills,
        budget,
    } = req.body;

    const { data, error } = await supabase
        .from("jobs")
        .insert({
            title,
            company,
            location,
            salary,
            description,
            job_type,
            skills,
            budget,
            posted_by: userId, // 🔥 ده أهم سطر
        })
        .select()
        .single();

    if (error) {
        console.log("CREATE JOB ERROR:", error);
        return res.status(400).json({ error });
    }

    res.json(data);
};


// ========================
// GET SINGLE JOB
// ========================
export const getJobById = async (req, res) => {
    const { jobId } = req.params;

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .single();

    if (error) return res.status(400).json({ error });

    res.json(data);
};


// ========================
// APPLY TO JOB (NO DUPLICATES)
// ========================
export const applyToJob = async (req, res) => {
    const userId = req.profile.id;
    const { job_id, cover_letter } = req.body;

    try {
        const { data: job } = await supabase
            .from("jobs")
            .select("id")
            .eq("id", job_id)
            .single();

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const { data: existing } = await supabase
            .from("job_applications")
            .select("id")
            .eq("job_id", job_id)
            .eq("user_id", userId)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({
                message: "You already applied to this job",
            });
        }

        const { data, error } = await supabase
            .from("job_applications")
            .insert({
                job_id,
                user_id: userId,
                cover_letter,
            })
            .select()
            .single();

        if (error) return res.status(400).json({ error });

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// ========================
// GET JOB APPLICANTS (OWNER ONLY)
// ========================
export const getJobApplicants = async (req, res) => {
    const { jobId } = req.params;
    const userId = req.profile.id;

    const { data: job } = await supabase
        .from("jobs")
        .select("posted_by")
        .eq("id", jobId)
        .single();

    if (!job) {
        return res.status(404).json({ message: "Job not found" });
    }

    if (job.posted_by !== userId) {
        return res.status(403).json({
            message: "You are not allowed to view applicants",
        });
    }

    const { data, error } = await supabase
        .from("job_applications")
        .select(`
            id,
            job_id,
            status,
            created_at,
            profiles (
                id,
                full_name,
                role,
                email,
                avatar_url,
                level
            )
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    res.json(data);
};


// ========================
// UPDATE APPLICATION STATUS
// ========================
export const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.profile.id;

    const { data: application } = await supabase
        .from("job_applications")
        .select(`*, jobs(*)`)
        .eq("id", applicationId)
        .single();

    if (!application) {
        return res.status(404).json({ message: "Application not found" });
    }

    if (application.jobs.posted_by !== userId) {
        return res.status(403).json({ message: "Not allowed" });
    }

    const { data, error } = await supabase
        .from("job_applications")
        .update({ status })
        .eq("id", applicationId)
        .select()
        .single();

    if (error) return res.status(400).json({ error });

    res.json(data);
};


// ========================
// MY JOBS
// ========================
export const getMyJobs = async (req, res) => {
    console.log("PROFILE ID:", req.profile.id);
    const userId = req.profile.id;

    const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("posted_by", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    res.json(data);
};


// ========================
// MY APPLICATIONS (FIXED RESPONSE SHAPE)
// ========================
export const getMyApplications = async (req, res) => {
    const userId = req.profile.id;

    const { data, error } = await supabase
        .from("job_applications")
        .select(`
            id,
            status,
            created_at,
            job:jobs (
                id,
                title,
                company,
                location,
                salary
            )
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });

    const formatted = data.map(app => ({
        application_id: app.id,
        status: app.status,
        created_at: app.created_at,
        job: app.job
    }));

    res.json(formatted);
};