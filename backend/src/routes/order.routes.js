const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { query } = require('../config/database');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/', authenticate, asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC', [req.user.id]);
    res.json({ success: true, orders: result.rows });
}));

router.get('/:id', authenticate, asyncHandler(async (req, res) => {
    const result = await query('SELECT * FROM orders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order: result.rows[0] });
}));

router.post('/', authenticate, asyncHandler(async (req, res) => {
    const { shipping_address, payment_method, items } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items provided' });
    const total = items.reduce((sum, i) => sum + (parseFloat(i.price) * parseInt(i.quantity)), 0);
    const orderNumber = 'ORD-' + Date.now();
    const orderResult = await query('INSERT INTO orders (order_number, user_id, total_amount, status, shipping_address, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING *', [orderNumber, req.user.id, total, 'pending', shipping_address]);
    const order = orderResult.rows[0];
    for (const item of items) {
        await query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)', [order.id, item.product_id, item.quantity, item.price]);
        await query('UPDATE products SET stock_quantity = stock_quantity - $1 WHERE id = $2', [item.quantity, item.product_id]);
    }
    if (payment_method) await query('INSERT INTO payments (order_id, user_id, amount, method, status, created_at) VALUES ($1, $2, $3, $4, $5, NOW())', [order.id, req.user.id, total, payment_method, 'pending']);
    const cartResult = await query('SELECT id FROM cart WHERE user_id = $1', [req.user.id]);
    if (cartResult.rows.length > 0) await query('DELETE FROM cart_items WHERE cart_id = $1', [cartResult.rows[0].id]);
    res.status(201).json({ success: true, order });
}));

router.post('/:id/cancel', authenticate, asyncHandler(async (req, res) => {
    const result = await query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND user_id = $3 AND status = $4 RETURNING *', ['cancelled', req.params.id, req.user.id, 'pending']);
    if (result.rows.length === 0) return res.status(400).json({ success: false, message: 'Cannot cancel this order' });
    res.json({ success: true, order: result.rows[0] });
}));

module.exports = router;