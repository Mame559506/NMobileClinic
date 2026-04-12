const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const isTech = authorize('technician', 'admin', 'manager');

// Middleware: verified technicians only
const verifiedTech = asyncHandler(async (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'manager') return next();
    const result = await query('SELECT is_verified FROM users WHERE id = $1', [req.user.id]);
    if (!result.rows[0]?.is_verified) {
        return res.status(403).json({ success: false, message: 'Your account must be verified by an admin before you can access repair tasks.' });
    }
    next();
});

// Get technician repairs (assigned + unassigned)
router.get('/repairs', authenticate, isTech, verifiedTech, asyncHandler(async (req, res) => {
    const result = await query(`
        SELECT r.*, u.email as customer_email, u.first_name, u.last_name,
               t.first_name as tech_first, t.last_name as tech_last
        FROM repairs r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN users t ON r.assigned_to = t.id
        WHERE r.assigned_to = $1 OR r.assigned_to IS NULL
        ORDER BY r.created_at DESC
    `, [req.user.id]);
    res.json({ success: true, repairs: result.rows });
}));

// Get stats for technician dashboard
router.get('/stats', authenticate, isTech, verifiedTech, asyncHandler(async (req, res) => {
    const [assigned, inProgress, completed, pending] = await Promise.all([
        query('SELECT COUNT(*) as total FROM repairs WHERE assigned_to = $1', [req.user.id]),
        query("SELECT COUNT(*) as total FROM repairs WHERE assigned_to = $1 AND status = 'in-progress'", [req.user.id]),
        query("SELECT COUNT(*) as total FROM repairs WHERE assigned_to = $1 AND status = 'completed'", [req.user.id]),
        query("SELECT COUNT(*) as total FROM repairs WHERE status = 'pending' AND assigned_to IS NULL"),
    ]);
    res.json({
        success: true,
        stats: {
            assigned: parseInt(assigned.rows[0].total),
            inProgress: parseInt(inProgress.rows[0].total),
            completed: parseInt(completed.rows[0].total),
            unassigned: parseInt(pending.rows[0].total),
        }
    });
}));

// Claim repair
router.post('/repairs/:id/claim', authenticate, isTech, verifiedTech, asyncHandler(async (req, res) => {
    const result = await query(
        `UPDATE repairs SET assigned_to = $1, status = 'diagnosed', updated_at = NOW()
         WHERE id = $2 AND (assigned_to IS NULL OR assigned_to = $1) RETURNING *`,
        [req.user.id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Cannot claim this repair' });
    res.json({ success: true, repair: result.rows[0] });
}));

// Update repair status/notes/cost
router.put('/repairs/:id', authenticate, isTech, verifiedTech, asyncHandler(async (req, res) => {
    const { status, notes, estimated_cost } = req.body;
    const isCompleted = status === 'completed';
    const result = await query(
        `UPDATE repairs SET
         status = $1,
         notes = $2,
         estimated_cost = $3,
         completed_at = CASE WHEN $4 THEN NOW() ELSE NULL END,
         updated_at = NOW()
         WHERE id = $5 AND assigned_to = $6 RETURNING *`,
        [status, notes, estimated_cost, isCompleted, req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(403).json({ success: false, message: 'Not authorized or repair not found' });
    res.json({ success: true, repair: result.rows[0] });
}));

module.exports = router;
