import supabase from "../config/supabase.js";
import { supabaseAdmin } from "../config/supabase.js";

export const getAdminDashboard = async (req, res) => {
    try {
        const { data: courses } = await supabase
            .from("courses")
            .select("id");

        const { data: lessons } = await supabase
            .from("lessons")
            .select("id");

        const { data: users } = await supabase
            .from("profiles")
            .select("id, role");

        res.json({
            totalCourses: courses.length,
            totalLessons: lessons.length,
            totalUsers: users.length
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getAllUsers = async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("profiles")
            .select("*");

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .update({ role })
            .eq("id", req.params.id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .delete()
            .eq("id", req.params.id)
            .select();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.json({
            message: "Deleted",
            data
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};