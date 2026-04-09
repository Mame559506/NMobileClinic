const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await query(
        `SELECT * FROM repairs WHERE user_id = $1 ORDER BY created_at DESC`,
        [req.user.id]
    );
    res.json({ success: true, repairs: result.rows });
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
    const { device_type, issue_description } = req.body;
    const result = await query(
        `INSERT INTO repairs (user_id, device_type, issue_description, status, created_at, updated_at)
         VALUES ($1, $2, $3, 'pending', NOW(), NOW()) RETURNING *`,
        [req.user.id, device_type, issue_description]
    );
    res.status(201).json({ success: true, repair: result.rows[0] });
}));

module.exports = router;
