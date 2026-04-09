const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Setup upload directory
const uploadDir = path.join(__dirname, '../uploads/receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, `receipt_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Get user payments
router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await query(
        `SELECT p.*, o.order_number FROM payments p
         LEFT JOIN orders o ON p.order_id = o.id
         WHERE p.user_id = $1 ORDER BY p.created_at DESC`,
        [req.user.id]
    );
    res.json({ success: true, payments: result.rows });
}));

// Submit payment proof (transaction ID + receipt)
router.post('/submit-proof', authenticate, upload.single('receipt'), asyncHandler(async (req, res) => {
    const { transaction_id, order_id } = req.body;
    const receipt_url = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    // Find the payment for this order
    const existing = await query(
        `SELECT id FROM payments WHERE order_id = $1 AND user_id = $2`,
        [order_id, req.user.id]
    );

    if (existing.rows.length > 0) {
        await query(
            `UPDATE payments SET transaction_id = $1, receipt_url = $2, status = 'pending'
             WHERE order_id = $3 AND user_id = $4`,
            [transaction_id, receipt_url, order_id, req.user.id]
        );
    } else {
        // Get order total
        const order = await query(`SELECT total_amount, shipping_address FROM orders WHERE id = $1`, [order_id]);
        await query(
            `INSERT INTO payments (order_id, user_id, amount, method, status, transaction_id, receipt_url, created_at)
             VALUES ($1, $2, $3, 'bank_transfer', 'pending', $4, $5, NOW())`,
            [order_id, req.user.id, order.rows[0]?.total_amount || 0, transaction_id, receipt_url]
        );
    }

    res.json({ success: true, message: 'Payment proof submitted successfully' });
}));

module.exports = router;
