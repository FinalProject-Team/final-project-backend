import { supabaseAdmin } from "../config/supabase.js";

export const getRanking = async (req, res) => {

    try {

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select(`
                id,
                full_name,
                avatar_url,
                level,
                xp_points,
                weekly_xp,
                streak,
                badges
            `)
            .order("weekly_xp", { ascending: false });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        const ranking = data.map((user, index) => ({
            rank: index + 1,
            ...user
        }));

        res.status(200).json({
            success: true,
            count: ranking.length,
            ranking
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};

export const getMyRank = async (req, res) => {

    try {

        const userId = req.user.id;

        // كل اليوزرز مرتبين
        const { data: users, error } = await supabaseAdmin
            .from("profiles")
            .select(`
                id,
                full_name,
                xp_points,
                weekly_xp
            `)
            .order("weekly_xp", { ascending: false });

        if (error) {
            return res.status(400).json({
                error: error.message
            });
        }

        // ترتيب اليوزر الحالي
        const currentIndex = users.findIndex(
            user => user.id === userId
        );

        if (currentIndex === -1) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        const currentUser = users[currentIndex];

        const rank = currentIndex + 1;

        // اليوزر اللي فوقه
        const previousUser =
            currentIndex > 0
                ? users[currentIndex - 1]
                : null;

        let xp_to_next_rank = 0;

        if (previousUser) {
            xp_to_next_rank =
                previousUser.weekly_xp -
                currentUser.weekly_xp;
        }

        res.status(200).json({
            success: true,
            rank,
            full_name: currentUser.full_name,
            weekly_xp: currentUser.weekly_xp,
            xp_points: currentUser.xp_points,
            xp_to_next_rank,
            next_rank: previousUser
                ? rank - 1
                : rank
        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

};