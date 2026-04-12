const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');
const { authorize } = require('../middlewares/auth.middleware');

const isDelivery = authorize('delivery_person', 'admin', 'manager');
const isAdmin = authorize('admin', 'manager');

// Verified delivery person middleware
const verifiedDelivery = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'manager') return next();
    const result = await query('SELECT is_verified FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]?.is_verified) {
        return res.status(403).json({ success: false, message: 'Account must be verified before accessing delivery tasks.' });
    }
    next();
});

// Get delivery person stats
router.get('/stats', isDelivery, verifiedDelivery, asyncHandler(async (req, res) => {
    const [pending, active, completed, total] = await Promise.all([
        query(`SELECT COUNT(*) as c FROM delivery_jobs WHERE assigned_to=$1 AND status='pending'`, [req.user.id]),
        query(`SELECT COUNT(*) as c FROM delivery_jobs WHERE assigned_to=$1 AND status='in-progress'`, [req.user.id]),
        query(`SELECT COUNT(*) as c FROM delivery_jobs WHERE assigned_to=$1 AND status='completed'`, [req.user.id]),
        query(`SELECT COUNT(*) as c FROM delivery_jobs WHERE assigned_to=$1`, [req.user.id]),
    ]);
    res.json({ success: true, stats: {
        pending: parseInt(pending.rows[0].c),
        active: parseInt(active.rows[0].c),
        completed: parseInt(completed.rows[0].c),
        total: parseInt(total.rows[0].c),
    }});
}));

// Get my jobs (tasks)
router.get('/jobs', isDelivery, verifiedDelivery, asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT dj.*, o.order_number, o.shipping_address,
               u.first_name as customer_first, u.last_name as customer_last, u.phone as customer_phone
        FROM delivery_jobs dj
        LEFT JOIN orders o ON dj.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE dj.assigned_to = $1
        ORDER BY dj.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, jobs: result.rows });
}));

// Get active job
router.get('/jobs/active', isDelivery, verifiedDelivery, asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT dj.*, o.order_number, o.shipping_address,
               u.first_name as customer_first, u.last_name as customer_last, u.phone as customer_phone
        FROM delivery_jobs dj
        LEFT JOIN orders o ON dj.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        WHERE dj.assigned_to = $1 AND dj.status = 'in-progress'
        ORDER BY dj.created_at DESC LIMIT 1
    `, [req.user.id]);
    res.json({ success: true, job: result.rows[0] || null });
}));

// Update job status
router.put('/jobs/:id', isDelivery, verifiedDelivery, asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const isCompleted = status === 'completed';
    const result = await query(`
        UPDATE delivery_jobs SET status=$1, notes=COALESCE($2,notes),
        completed_at = CASE WHEN $3 THEN NOW() ELSE NULL END,
        updated_at=NOW()
        WHERE id=$4 AND assigned_to=$5 RETURNING *
    `, [status, notes, isCompleted, req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Job not found' });
    // If completed, update order status to delivered
    if (isCompleted && result.rows[0].order_id) {
        await query(`UPDATE orders SET status='delivered', updated_at=NOW() WHERE id=$1`, [result.rows[0].order_id]);
    }
    res.json({ success: true, job: result.rows[0] });
}));

// Admin: get all delivery jobs
router.get('/admin/jobs', isAdmin, asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT dj.*, o.order_number, o.shipping_address,
               u.first_name as customer_first, u.last_name as customer_last,
               d.first_name as driver_first, d.last_name as driver_last
        FROM delivery_jobs dj
        LEFT JOIN orders o ON dj.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users d ON dj.assigned_to = d.id
        ORDER BY dj.created_at DESC
    `);
    res.json({ success: true, jobs: result.rows });
}));

// Admin: assign delivery job
router.post('/admin/jobs', isAdmin, asyncHandler(async (req, res) => {
    const { order_id, assigned_to, pickup_address, delivery_address, notes } = req.body;
    const result = await query(`
        INSERT INTO delivery_jobs (order_id, assigned_to, pickup_address, delivery_address, notes, status, created_at, updated_at)
        VALUES ($1,$2,$3,$4,$5,'pending',NOW(),NOW()) RETURNING *
    `, [order_id, assigned_to, pickup_address, delivery_address, notes]);
    res.status(201).json({ success: true, job: result.rows[0] });
}));

module.exports = router;
