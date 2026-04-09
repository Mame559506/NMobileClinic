const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');

router.get('/', asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM categories ORDER BY name');
    res.json({ success: true, categories: result.rows });
}));

module.exports = router;
