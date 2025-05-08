const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.decode(token);

        if (!decoded || decoded.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied. Admin only.' });
        }

        req.user = decoded.user;
        next();
    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};
