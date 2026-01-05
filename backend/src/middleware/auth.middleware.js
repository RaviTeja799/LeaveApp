import jwt from 'jsonwebtoken';
import db from '../db/index.js';

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        
        // Fetch user details from database
        const userQuery = 'SELECT uid, name, level, role FROM users WHERE uid = $1';
        const { rows } = await db.query(userQuery, [decoded.uid]);
        
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid token. User not found.' });
        }

        req.user = rows[0];
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        res.status(500).json({ error: 'Server error during authentication.' });
    }
};

export default auth;