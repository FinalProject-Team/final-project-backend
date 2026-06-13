// ─────────────────────────────────────────────────────────────
// jobs.controller.js — PRODUCTION-FIXED VERSION
//
// BUGS FIXED:
// 1. getMyApplications used `supabase` (user client) which is
//    subject to RLS. If no SELECT policy exists for the user on
//    job_applications, it silently returns [] — no error, just
//    empty data. Fixed: use supabaseAdmin for server-side reads.
//
// 2. applyToJob duplicate check used `supabase` (RLS-gated).
//    If RLS blocked the SELECT, existing was always null →
//    duplicate check always passed → DB constraint fired.
//    Fixed: use supabaseAdmin for the duplicate check too.
//
// 3. applyToJob already used supabaseAdmin for INSERT (correct).
//    Now the SELECT check also uses supabaseAdmin — consistent.
// ─────────────────────────────────────────────────────────────

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
// export const createJob = async (req, res) => {
//     try {
//         const userId = req.profile.id;

//         // 🔒 ROLE CHECK
//         if (req.profile.role !== "admin") {
//             return res.status(403).json({ message: "Only admin can create jobs" });
//         }

//         const { title, company, location, salary, description, job_type, skills, budget } = req.body;

//         // 🔒 VALIDATION
//         if (!title || !company || !location) {
//             return res.status(400).json({ message: "Missing required fields" });
//         }

//         const { data, error } = await supabase
//             .from("jobs")
//             .insert([
//                 {
//                     title,
//                     company,
//                     location,
//                     salary,
//                     description,
//                     job_type,
//                     skills,
//                     budget,
//                     posted_by: userId
//                 }
//             ])
//             .select()
//             .single();

//         if (error) {
//             console.log("CREATE JOB ERROR:", error);
//             return res.status(400).json({ error: error.message });
//         }

//         return res.status(201).json(data);

//     } catch (err) {
//         return res.status(500).json({ error: err.message });
//     }
// };

export const createJob = async (req, res) => {
    try {
        const userId = req.profile.id;
        const role = req.profile.role;

        // 🔒 ROLE CHECK
        if (!["admin", "employer"].includes(role)) {
            return res.status(403).json({
                message: "Only admin or employer can create jobs"
            });
        }

        const { title, company, location, salary, description, job_type, skills, budget } = req.body;

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
                    posted_by_role: role   // 👈 مهم جدًا
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
// FIX: both duplicate check AND insert now use supabaseAdmin.
// Using the user-level supabase client for the check meant RLS
// could silently return null (not an error), making the guard
// always pass even when a row existed.
// ========================
export const applyToJob = async (req, res) => {
    const userId = req.profile.id;
    const { job_id, cover_letter } = req.body;

    try {
        // 🔒 ROLE CHECK
        if (req.profile.role !== "student") {
            return res.status(403).json({ message: "Only students can apply" });
        }

        // 1. Verify job exists
        const { data: job, error: jobError } = await supabaseAdmin
            .from("jobs")
            .select("id, posted_by")
            .eq("id", job_id)
            .single();

        if (jobError || !job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // 2. Prevent self-apply
        if (job.posted_by === userId) {
            return res.status(400).json({ message: "You cannot apply to your own job" });
        }

        // 3. Duplicate check
        const { data: existing } = await supabaseAdmin
            .from("job_applications")
            .select("id")
            .eq("job_id", job_id)
            .eq("user_id", userId)
            .maybeSingle();

        if (existing) {
            return res.status(400).json({ message: "You already applied to this job" });
        }

        const cover = cover_letter?.trim() || null;

        // 4. Insert
        const { data, error } = await supabaseAdmin
            .from("job_applications")
            .insert({
                job_id,
                user_id: userId,
                cover_letter: cover
            })
            .select()
            .single();

        if (error) {
            if (error.code === "23505") {
                return res.status(400).json({ message: "You already applied to this job" });
            }
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
    const { jobId } = req.params;
    const userId = req.profile.id;

    if (!jobId) {
        return res.status(400).json({ message: "Invalid job id" });
    }

    // 1. check job ownership
    const { data: job, error: jobError } = await supabaseAdmin
        .from("jobs")
        .select("posted_by")
        .eq("id", jobId)
        .single();

    if (jobError || !job) {
        return res.status(404).json({ message: "Job not found" });
    }

    if (job.posted_by !== userId) {
        return res.status(403).json({
            message: "You are not allowed to view applicants",
        });
    }

    // 2. get applicants
    const { data, error } = await supabaseAdmin
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

    if (error) {
        return res.status(400).json({ error: error.message });
    }

    return res.json(data || []);
};
// ========================
// UPDATE APPLICATION STATUS
// ========================
export const updateApplicationStatus = async (req, res) => {
    const { applicationId } = req.params;
    const { status } = req.body;
    const userId = req.profile.id;

    const { data: application } = await supabaseAdmin
        .from("job_applications")
        .select(`*, jobs(*)`)
        .eq("id", applicationId)
        .single();

    if (!application) return res.status(404).json({ message: "Application not found" });

    if (application.jobs.posted_by !== userId) {
        return res.status(403).json({ message: "Not allowed" });
    }

    const { data, error } = await supabaseAdmin
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
    console.log("GET MY JOBS HIT");
    const userId = req.profile.id;

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
// FIX: switched from `supabase` to `supabaseAdmin`.
// The user-level Supabase client applies RLS. Without an explicit
// "users can select their own rows" policy on job_applications,
// the query returns [] silently — which is indistinguishable from
// "no applications" on the frontend. supabaseAdmin bypasses RLS,
// which is correct here because this is an authenticated server
// endpoint that already verified the user via req.profile.id.
// ========================
export const getMyApplications = async (req, res) => {
    const userId = req.profile.id;

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

    // Guard against null job (deleted jobs) to prevent .map crash
    const formatted = data
        .filter(app => app.job !== null)
        .map(app => ({
            id: app.id,
            job_id: app.job.id,
            status: app.status,
            created_at: app.created_at,
            job: app.job,
        }));

    res.json(formatted);
};
