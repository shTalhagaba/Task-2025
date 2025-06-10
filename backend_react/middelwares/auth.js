const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Authorization Header:', authHeader);
        
        if (!authHeader) {
            return res.status(401).json({ message: "Authentication failed. Token missing." });
        }

        // Check if token starts with 'Bearer '
        if (!authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: "Authentication failed. Invalid token format." });
        }

        // Extract the token (remove 'Bearer ' prefix)
        const token = authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: "Authentication failed. Token missing." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ message: 'Authentication failed. Invalid token.' });
    }
}

module.exports = auth;