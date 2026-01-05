import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db/index.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email
        const userQuery = 'SELECT * FROM users WHERE email = $1';
        const { rows } = await db.query(userQuery, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { uid: user.uid, email: user.email, level: user.level },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Return user info (without password) and token
        const { password_hash, ...userInfo } = user;
        
        res.json({
            message: 'Login successful',
            token,
            user: userInfo
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
};

export const register = async (req, res) => {
    try {
        const { name, email, password, role, level, department } = req.body;

        if (!name || !email || !password || !role || !level) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await db.query('SELECT uid FROM users WHERE email = $1', [email]);
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const insertQuery = `
            INSERT INTO users (name, email, password_hash, role, level, department)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING uid, name, email, role, level, department, created_at
        `;

        const { rows } = await db.query(insertQuery, [
            name, email, password_hash, role, level, department
        ]);

        const newUser = rows[0];

        res.status(201).json({
            message: 'User registered successfully',
            user: newUser
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
};