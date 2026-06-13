export const allowRoles = (...roles) => {
    return (req, res, next) => {
        const userRole = req.profile?.role;

        if (!userRole) {
            return res.status(401).json({ message: "No role found" });
        }

        if (!roles.includes(userRole)) {
            return res.status(403).json({ message: "Forbidden: not allowed" });
        }

        next();
    };
};