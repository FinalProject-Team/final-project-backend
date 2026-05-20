export const authorize = (...allowedRoles) => {

    return (req, res, next) => {

        console.log("PROFILE:", req.profile);
        console.log("ROLE:", req.profile?.role);
        console.log("ALLOWED:", allowedRoles);

        try {

            const userRole = req.profile.role;

            if (!allowedRoles.includes(userRole)) {
                return res.status(403).json({
                    message: "Forbidden"
                });
            }

            next();

        } catch (error) {

            res.status(500).json({
                error: error.message
            });

        }

    };

};