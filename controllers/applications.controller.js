export const acceptApplication = async (req, res) => {
    const { id } = req.params;
    const employerId = req.profile.id;

    // 1. get application
    const { data: application, error: appError } = await supabaseAdmin
        .from("job_applications")
        .select("*")
        .eq("id", id)
        .single();

    if (appError || !application) {
        return res.status(404).json({ message: "Application not found" });
    }

    // 2. verify job owner
    const { data: job, error: jobError } = await supabaseAdmin
        .from("jobs")
        .select("posted_by")
        .eq("id", application.job_id)
        .single();

    if (jobError || !job || job.posted_by !== employerId) {
        return res.status(403).json({ message: "Not allowed" });
    }

    // 3. update application status
    const { error: updateError } = await supabaseAdmin
        .from("job_applications")
        .update({ status: "accepted" })
        .eq("id", id);

    if (updateError) {
        return res.status(500).json({ message: "Failed to update application" });
    }

    // 4. check existing chat
    const { data: existingChat, error: chatCheckError } = await supabaseAdmin
        .from("chats")
        .select("*")
        .eq("employer_id", employerId)
        .eq("user_id", application.user_id)
        .eq("job_id", application.job_id)
        .maybeSingle();

    if (chatCheckError) {
        return res.status(500).json({ message: "Chat check failed" });
    }

    let chat = existingChat;

    // 5. create chat if not exists
    if (!existingChat) {
        const { data: newChat, error: chatError } = await supabaseAdmin
            .from("chats")
            .insert([
                {
                    employer_id: employerId,
                    user_id: application.user_id,
                    job_id: application.job_id,
                },
            ])
            .select()
            .single();

        if (chatError) {
            return res.status(500).json({ message: "Failed to create chat" });
        }

        chat = newChat;
    }

    return res.status(200).json({
        message: "Application accepted successfully",
        chat,
    });
};

export const rejectApplication = async (req, res) => {
    const { id } = req.params;
    const employerId = req.profile.id;

    const { data: application, error: appError } = await supabaseAdmin
        .from("job_applications")
        .select("*")
        .eq("id", id)
        .single();

    if (appError || !application) {
        return res.status(404).json({ message: "Application not found" });
    }

    const { data: job, error: jobError } = await supabaseAdmin
        .from("jobs")
        .select("posted_by")
        .eq("id", application.job_id)
        .single();

    if (jobError || !job || job.posted_by !== employerId) {
        return res.status(403).json({ message: "Not allowed" });
    }

    const { error: updateError } = await supabaseAdmin
        .from("job_applications")
        .update({ status: "rejected" })
        .eq("id", id);

    if (updateError) {
        return res.status(500).json({ message: "Failed to reject application" });
    }

    return res.status(200).json({
        message: "Application rejected successfully",
    });
};

export const getApplications = async (req, res) => {
    const employerId = req.profile.id;

    // 1. هات الوظايف بتاعة الـ employer
    const { data: jobs, error: jobsError } = await supabaseAdmin
        .from("jobs")
        .select("id")
        .eq("posted_by", employerId);

    if (jobsError) {
        return res.status(500).json({ message: "Failed to fetch jobs" });
    }

    const jobIds = jobs.map(job => job.id);

    // 2. هات الـ applications بتاعة الوظايف دي
    const { data: applications, error } = await supabaseAdmin
        .from("job_applications")
        .select("*")
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

    if (error) {
        return res.status(500).json({ message: "Failed to fetch applications" });
    }

    return res.json(applications);
};