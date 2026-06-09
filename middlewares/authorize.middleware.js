export const authorize = (...roles) => {
    return (req, res, next) => {
        console.log("🔥 AUTHORIZE HIT");

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