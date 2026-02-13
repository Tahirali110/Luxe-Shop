const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        if (req.user.role === 'demo_admin') {
            if (req.method === 'GET') {
                next();
            } else {
                res.status(403);
                throw new Error('Demo Admin: Read-only access.');
            }
        } else {
            next();
        }
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { admin };
