// =========================
// 📝 GET POSTS

import { supabaseAdmin } from "../config/supabase.js";

// =========================
export const fetchPosts = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("community_posts")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// =========================
// 📝 CREATE POST
// =========================
export const createPost = async (req, res) => {
  try {
    const { content, image, type } = req.body;

    const { data, error } = await supabaseAdmin
      .from("community_posts")
      .insert([
        {
          content,
          image,
          author_id: req.profile.id,   // مهم
          type: type || "Discussion",  // مهم
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// =========================
// ❤️ LIKE POST
// =========================
export const likePost = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.profile.id;

        // (simple version)
        const { data, error } = await supabaseAdmin
            .from("post_likes")
            .insert([{ post_id: id, user_id: userId }]);

        if (error) throw error;

        res.json({ message: "liked" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// =========================
// 🔖 SAVE POST
// =========================
export const savePost = async (req, res) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabaseAdmin
            .from("saved_posts")
            .insert([
                {
                    post_id: id,
                    user_id: req.profile.id,
                },
            ]);

        if (error) throw error;

        res.json({ message: "saved" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// =========================
// 💬 COMMENT POST
// =========================
export const postComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment } = req.body;

        const { data, error } = await supabaseAdmin
            .from("comments")
            .insert([
                {
                    post_id: id,
                    author_id: req.profile.id, // مهم جدًا هنا مش user_id
                    content: comment,
                },
            ])
            .select()
            .single();

        if (error) throw error;

        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// =========================
// 🗑 DELETE POST
// =========================
export const removePost = async (req, res) => {
    try {
        const { id } = req.params;

        const { error } = await supabaseAdmin
            .from("community_posts")
            .delete()
            .eq("id", id);

        if (error) throw error;

        res.json({ message: "deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// =========================
// 📊 POLL VOTE
// =========================
export const castPollVote = async (req, res) => {
    try {
        const { id } = req.params;
        const { option } = req.body;

        const { data, error } = await supabaseAdmin
            .from("poll_votes")
            .insert([
                {
                    post_id: id,
                    author_id: req.profile.id,
                    option,
                },
            ]);

        if (error) throw error;

        res.json({ message: "vote added" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



export const fetchTrending = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("community_posts")
            .select("*")
            .order("likes_count", { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const fetchLeaderboard = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .order("reputation", { ascending: false })
            .limit(10);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const fetchEvents = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("live_sessions")
            .select("*")
            .order("scheduled_at", { ascending: true });

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
export const fetchSuggestedMembers = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .limit(5);

        if (error) throw error;

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


export const followUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const { error } = await supabaseAdmin
            .from("follows")
            .insert([
                {
                    follower_id: req.profile.id,
                    following_id: userId,
                },
            ]);

        if (error) throw error;

        res.json({ message: "followed" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};