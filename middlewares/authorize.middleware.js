export const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("🔥 AUTHORIZE HITtttttttttttttttt");
        console.log("🔥 AUTHORIZE HIT");
        console.log("ROLE:", req.profile?.role);
        console.log("ALLOWED:", roles);

        if (!req.profile) {
            return res.status(403).json({ message: "No profile" });
        }

        if (!roles.includes(req.profile.role)) {
            return res.status(403).json({
                message: "Forbidden role"
            });
        }

        next();
    };
};