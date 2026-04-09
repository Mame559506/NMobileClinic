const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

// Get all products (public)
router.get('/', asyncHandler(async (req, res) => {
    const { 
        page = 1, 
        limit = 10, 
        category, 
        search, 
        minPrice, 
        maxPrice,
        sortBy = 'created_at',
        sortOrder = 'DESC'
    } = req.query;

    let queryStr = `
        SELECT p.*, c.name as category_name 
        FROM products p 
        LEFT JOIN categories c ON p.category_id = c.id 
        WHERE p.is_active = true
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
        paramCount++;
        queryStr += ` AND c.slug = $` + paramCount;
        params.push(category);
    }

    if (search) {
        paramCount++;
        queryStr += ` AND (p.name ILIKE $` + paramCount + ` OR p.description ILIKE $` + paramCount + `)`;
        params.push(`%${search}%`);
    }

    if (minPrice) {
        paramCount++;
        queryStr += ` AND p.price >= $` + paramCount;
        params.push(minPrice);
    }

    if (maxPrice) {
        paramCount++;
        queryStr += ` AND p.price <= $` + paramCount;
        params.push(maxPrice);
    }

    const countQuery = `SELECT COUNT(*) FROM (` + queryStr + `) as count_query`;
    const countResult = await query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    const validSortColumns = ['name', 'price', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    queryStr += ` ORDER BY p.` + sortColumn + ` ` + sortDirection;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    paramCount++;
    queryStr += ` LIMIT $` + paramCount;
    params.push(parseInt(limit));

    paramCount++;
    queryStr += ` OFFSET $` + paramCount;
    params.push(offset);

    const result = await query(queryStr, params);

    res.json({
        success: true,
        products: result.rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit))
        }
    });
}));

// Get featured products  must be before /:id
router.get('/featured/products', asyncHandler(async (req, res) => {
    const result = await query(
        `SELECT id, name, price, image_url, image_urls, stock_quantity, short_description 
         FROM products 
         WHERE is_featured = true AND is_active = true 
         ORDER BY created_at DESC 
         LIMIT 8`
    );
    res.json({ success: true, products: result.rows });
}));

// Get products by category  must be before /:id
router.get('/category/:slug', asyncHandler(async (req, res) => {
    const { slug } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const result = await query(
        `SELECT p.*, c.name as category_name 
         FROM products p 
         JOIN categories c ON p.category_id = c.id 
         WHERE c.slug = $1 AND p.is_active = true 
         ORDER BY p.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [slug, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );
    const countResult = await query(
        `SELECT COUNT(*) FROM products p JOIN categories c ON p.category_id = c.id WHERE c.slug = $1 AND p.is_active = true`,
        [slug]
    );
    res.json({ success: true, products: result.rows, total: parseInt(countResult.rows[0].count) });
}));

// Get single product
router.get('/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query(
        `SELECT p.*, c.name as category_name, c.slug as category_slug 
         FROM products p 
         LEFT JOIN categories c ON p.category_id = c.id 
         WHERE p.id = $1 AND p.is_active = true`,
        [id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found' });
    }
    const relatedProducts = await query(
        `SELECT id, name, price, image_url, stock_quantity FROM products WHERE category_id = $1 AND id != $2 AND is_active = true LIMIT 4`,
        [result.rows[0].category_id, id]
    );
    res.json({ success: true, product: result.rows[0], relatedProducts: relatedProducts.rows });
}));

// Create product (admin only)
router.post('/', authenticate, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    const { name, description, short_description, price, stock_quantity, category_id, sku, brand, specifications, features, is_featured, image_url } = req.body;
    const result = await query(
        `INSERT INTO products (name, description, short_description, price, stock_quantity, category_id, sku, brand, specifications, features, is_featured, image_url, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW()) RETURNING *`,
        [name, description, short_description, price, stock_quantity, category_id, sku, brand,
         JSON.stringify(specifications || {}), JSON.stringify(features || []), is_featured || false, image_url || null]
    );
    res.status(201).json({ success: true, message: 'Product created successfully', product: result.rows[0] });
}));

// Update product (admin only)
router.put('/:id', authenticate, authorize('admin', 'manager'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const allowed = ['name', 'description', 'short_description', 'price', 'stock_quantity', 'category_id', 'sku', 'brand', 'is_featured', 'is_active', 'image_url'];
    const updates = {};
    for (const key of allowed) {
        if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) return res.status(400).json({ success: false, message: 'No updates provided' });
    const keys = Object.keys(updates);
    const setClause = keys.map((k, i) => k + ' = $' + (i + 1)).join(', ');
    const values = [...Object.values(updates), id];
    const result = await query(
        `UPDATE products SET ` + setClause + `, updated_at = NOW() WHERE id = $` + values.length + ` RETURNING *`,
        values
    );
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product updated successfully', product: result.rows[0] });
}));

// Delete product (admin only)
router.delete('/:id', authenticate, authorize('admin'), asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
}));

module.exports = router;
