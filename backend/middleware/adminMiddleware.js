const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // User is admin, proceed
    } else {
        res.status(403); // Forbidden
        throw new Error('Not authorized as an admin');
    }
};

export { admin };