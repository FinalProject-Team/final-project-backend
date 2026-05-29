import supabase, { supabaseAdmin } from "../config/supabase.js";

/* =========================================
   GET COURSES
========================================= */
export const getCourses = async (req, res) => {
    try {
        const search = req.query.search;
        const category = req.query.category;
        const price = req.query.price;
        const level = req.query.level;

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
            .from("courses")
            .select("*")
            .range(from, to);

        if (search) {
            query = query.ilike("title", `%${search}%`);
        }

        if (category) {
            query = query.eq("category", category);
        }

        if (price) {
            query = query.eq("price", price);
        }

        if (level) {
            query = query.eq("level", level);
        }

        const { data, error } = await query;

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================================
   GET SINGLE COURSE
========================================= */
export const getSingleCourse = async (req, res) => {
    const { id } = req.params;

    const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
};

/* =========================================
   CREATE COURSE + NOTIFICATION
========================================= */
export const createCourse = async (req, res) => {
    try {
        const courseData = {
            ...req.body,
            instructor_id: req.profile.id,
        };

        const { data, error } = await supabaseAdmin
            .from("courses")
            .insert([courseData])
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // 🔔 Notification (للمعلم نفسه أو لاحقًا subscribers)
        await supabaseAdmin.from("notifications").insert([
            {
                user_id: req.profile.id,
                title: "New Course Created",
                message: `Course "${data[0].title}" has been created successfully`,
                type: "course_created",
                read: false,
            },
        ]);

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================================
   UPDATE COURSE + NOTIFICATIONS
========================================= */
export const updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const { data, error } = await supabaseAdmin
            .from("courses")
            .update(updatedData)
            .eq("id", id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // 🔥 Get enrolled students
        const { data: enrollments } = await supabaseAdmin
            .from("enrollments")
            .select("user_id")
            .eq("course_id", id);

        if (enrollments && enrollments.length > 0) {
            const notifications = enrollments.map((e) => ({
                user_id: e.user_id,
                title: "Course updated",
                message: `Course "${data[0].title}" has been updated`,
                type: "course_update",
                read: false,
            }));

            await supabaseAdmin.from("notifications").insert(notifications);
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

/* =========================================
   DELETE COURSE + NOTIFICATION
========================================= */
export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("courses")
            .delete()
            .eq("id", id)
            .select();

        if (error) {
            return res.status(500).json({ error: error.message });
        }

        // 🔔 Optional notification (students or instructor)
        await supabaseAdmin.from("notifications").insert([
            {
                user_id: req.profile.id,
                title: "Course deleted",
                message: "A course has been removed",
                type: "course_deleted",
                read: false,
            },
        ]);

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};