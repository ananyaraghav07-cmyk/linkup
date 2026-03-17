/**
 * LifeLink Twin - Authentication Module
 * 
 * Handles user authentication with bcrypt password hashing and JWT tokens
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret key for JWT - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'lifelink-twin-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

// In-memory user store (In production, use a real database)
const users = new Map();

// Default user(s) for demo
const createDefaultUsers = async () => {
    const defaultUsers = [
        {
            username: 'doctor',
            password: 'doctor123',
            role: 'doctor',
            name: 'Dr. Smith',
            email: 'doctor@lifelink.com'
        }
    ];

    for (const user of defaultUsers) {
        const hashedPassword = await hashPassword(user.password);
        users.set(user.username, {
            username: user.username,
            password: hashedPassword,
            role: user.role,
            name: user.name,
            email: user.email,
            createdAt: new Date().toISOString()
        });
    }

    console.log('✅ Default users created:');
    console.log('   👨‍⚕️ doctor/doctor123 (Doctor)');
};

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} True if match
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Generate JWT token
 * @param {object} user - User object
 * @returns {string} JWT token
 */
const generateToken = (user) => {
    const payload = {
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object|null} Decoded token or null if invalid
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

/**
 * Register a new user
 * @param {object} userData - User registration data
 * @returns {Promise<object>} Success status and message
 */
const registerUser = async (userData) => {
    const { username, password, role, name, email } = userData;

    // Enforce doctor-only accounts for this deployment
    if (role && role !== 'doctor') {
        return { success: false, message: 'Only doctor accounts can be registered' };
    }

    // Validation
    if (!username || !password || !name) {
        return { success: false, message: 'Username, password, and name are required' };
    }

    if (users.has(username)) {
        return { success: false, message: 'Username already exists' };
    }

    if (password.length < 6) {
        return { success: false, message: 'Password must be at least 6 characters' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Store user
    const newUser = {
        username,
        password: hashedPassword,
        role: 'doctor',
        name,
        email: email || '',
        createdAt: new Date().toISOString()
    };

    users.set(username, newUser);

    return {
        success: true,
        message: 'User registered successfully',
        user: {
            username: newUser.username,
            role: newUser.role,
            name: newUser.name,
            email: newUser.email
        }
    };
};

/**
 * Authenticate user
 * @param {string} username - Username
 * @param {string} password - Plain text password
 * @returns {Promise<object>} Success status, token, and user data
 */
const authenticateUser = async (username, password) => {
    const user = users.get(username);

    if (!user) {
        return { success: false, message: 'Invalid username or password' };
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        return { success: false, message: 'Invalid username or password' };
    }

    // Generate token
    const token = generateToken(user);

    return {
        success: true,
        message: 'Login successful',
        token,
        user: {
            username: user.username,
            role: user.role,
            name: user.name,
            email: user.email
        }
    };
};

/**
 * Middleware to protect routes
 * Checks both JWT token and session
 */
const authMiddleware = (req, res, next) => {
    // First check session
    if (req.session?.user) {
        req.user = req.session.user;
        return next();
    }

    // Then check JWT token
    const token = req.headers.authorization?.split(' ')[1] || req.cookies?.token;

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided. Please login.' });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token. Please login again.' });
    }

    req.user = decoded;
    next();
};

/**
 * Session-based auth middleware (stricter - only session, no JWT)
 */
const sessionAuthMiddleware = (req, res, next) => {
    if (!req.session?.user) {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }
    req.user = req.session.user;
    next();
};

module.exports = {
    createDefaultUsers,
    hashPassword,
    comparePassword,
    generateToken,
    verifyToken,
    registerUser,
    authenticateUser,
    authMiddleware,
    sessionAuthMiddleware
};
