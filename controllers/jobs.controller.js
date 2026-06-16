import supabase, { supabaseAdmin } from "../config/supabase.js";


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
    try {
        const userId = req.user.id;
        const role = req.user.role;

        if (!["admin", "employer"].includes(role)) {
            return res.status(403).json({
                message: "Only admin or employer can create jobs"
            });
        }

        const {
            title,
            company,
            location,
            salary,
            description,
            job_type,
            skills,
            budget
        } = req.body;

        if (!title || !company || !location) {
            return res.status(400).json({
                message: "Missing required fields"
            });
        }

        const { data, error } = await supabase
            .from("jobs")
            .insert([
                {
                    title,
                    company,
                    location,
                    salary,
                    description,
                    job_type,
                    skills,
                    budget,
                    posted_by: userId,
                    posted_by_role: role
                }
            ])
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.status(201).json(data);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
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
// APPLY TO JOB
// ========================
export const applyToJob = async (req, res) => {
    try {
        const userId = req.user.id;
        const { job_id, cover_letter } = req.body;

        const allowedRoles = ["student", "job_seeker", "admin"];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: "You are not allowed to apply for jobs"
            });
        }

        // get job
        const { data: job, error: jobError } = await supabaseAdmin
            .from("jobs")
            .select("id, posted_by")
            .eq("id", job_id)
            .single();

        if (jobError || !job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // prevent self apply
        if (job.posted_by === userId) {
            return res.status(400).json({
                message: "You cannot apply to your own job"
            });
        }

        // duplicate check
        const { data: existing } = await supabaseAdmin
            .from("job_applications")
            .select("id")
            .eq("job_id", job_id)
            .eq("user_id", userId)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({
                message: "You already applied to this job"
            });
        }

        const { data, error } = await supabaseAdmin
            .from("job_applications")
            .insert({
                job_id,
                user_id: userId,
                cover_letter: cover_letter?.trim() || null
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        return res.json({
            message: "Applied successfully",
            application: data
        });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// ========================
// GET JOB APPLICANTS (OWNER ONLY)
// ========================
export const getJobApplicants = async (req, res) => {
    try {
        const { jobId } = req.params;
        const userId = req.user.id;

        const { data: job, error } = await supabaseAdmin
            .from("jobs")
            .select("posted_by")
            .eq("id", jobId)
            .single();

        if (error || !job) {
            return res.status(404).json({ message: "Job not found" });
        }

        if (job.posted_by !== userId) {
            return res.status(403).json({
                message: "You are not allowed to view applicants"
            });
        }

        const { data, error: appError } = await supabaseAdmin
            .from("job_applications")
            .select(`
                id,
                job_id,
                status,
                created_at,
                cover_letter,
                user:profiles (
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

        if (appError) {
            return res.status(400).json({ error: appError.message });
        }

        return res.json(data || []);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// ========================
// UPDATE APPLICATION STATUS
// ========================
export const updateApplicationStatus = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const { data: application } = await supabaseAdmin
            .from("job_applications")
            .select(`*, jobs(*)`)
            .eq("id", applicationId)
            .single();

        if (!application) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        if (application.jobs.posted_by !== userId) {
            return res.status(403).json({
                message: "Not allowed"
            });
        }

        const { data, error } = await supabaseAdmin
            .from("job_applications")
            .update({ status })
            .eq("id", applicationId)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};


// ========================
// MY JOBS
// ========================
export const getMyJobs = async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
        .from("jobs")
        .select("*")
        .eq("posted_by", userId)
        .order("created_at", { ascending: false });

    if (error) return res.status(400).json({ error });
    res.json(data);
};


// ========================
// MY APPLICATIONS
// ========================
export const getMyApplications = async (req, res) => {
    const userId = req.user.id;

    const { data, error } = await supabaseAdmin
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

    const formatted = (data || [])
        .filter(app => app.job !== null)
        .map(app => ({
            id: app.id,
            job_id: app.job.id,
            status: app.status,
            created_at: app.created_at,
            job: app.job
        }));

    res.json(formatted);
};