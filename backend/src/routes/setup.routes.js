const express = require('express');
const router = express.Router();
const { query } = require('../config/database');

// One-time setup endpoint - run schema and seed
router.post('/setup', async (req, res) => {
    const secret = req.headers['x-setup-secret'];
    if (secret !== 'nancy-setup-2024') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    try {
        // Create tables
        await query(`CREATE TABLE IF NOT EXISTS roles (id SERIAL PRIMARY KEY, name VARCHAR(50) UNIQUE NOT NULL, permissions TEXT[] DEFAULT '{}')`);
        await query(`CREATE TABLE IF NOT EXISTS users (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), email VARCHAR(255) UNIQUE NOT NULL, password_hash VARCHAR(255) NOT NULL, first_name VARCHAR(100), last_name VARCHAR(100), phone VARCHAR(20), address TEXT, role_id INTEGER REFERENCES roles(id), is_active BOOLEAN DEFAULT true, is_verified BOOLEAN DEFAULT false, verification_status VARCHAR(50) DEFAULT 'unverified', national_id VARCHAR(100), fan_number VARCHAR(100), profile_picture VARCHAR(255), last_login TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS categories (id SERIAL PRIMARY KEY, name VARCHAR(100) NOT NULL, slug VARCHAR(100) UNIQUE NOT NULL, description TEXT, created_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS products (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, description TEXT, short_description TEXT, price DECIMAL(10,2) NOT NULL, stock_quantity INTEGER DEFAULT 0, category_id INTEGER REFERENCES categories(id), image_url VARCHAR(255), image_urls JSONB DEFAULT '[]', sku VARCHAR(100), brand VARCHAR(100), specifications JSONB DEFAULT '{}', features JSONB DEFAULT '[]', is_featured BOOLEAN DEFAULT false, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS cart (id SERIAL PRIMARY KEY, user_id UUID REFERENCES users(id) ON DELETE CASCADE, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS cart_items (id SERIAL PRIMARY KEY, cart_id INTEGER REFERENCES cart(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), quantity INTEGER NOT NULL DEFAULT 1, created_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS orders (id SERIAL PRIMARY KEY, order_number VARCHAR(50) UNIQUE NOT NULL, user_id UUID REFERENCES users(id), total_amount DECIMAL(10,2) NOT NULL, status VARCHAR(50) DEFAULT 'pending', shipping_address TEXT, payment_method VARCHAR(50), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE, product_id INTEGER REFERENCES products(id), quantity INTEGER NOT NULL, unit_price DECIMAL(10,2) NOT NULL)`);
        await query(`CREATE TABLE IF NOT EXISTS payments (id SERIAL PRIMARY KEY, order_id INTEGER REFERENCES orders(id), user_id UUID REFERENCES users(id), amount DECIMAL(10,2) NOT NULL, method VARCHAR(50), status VARCHAR(50) DEFAULT 'pending', reference VARCHAR(100), transaction_id VARCHAR(255), receipt_url VARCHAR(255), verified_at TIMESTAMP, verified_by UUID REFERENCES users(id), created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS repairs (id SERIAL PRIMARY KEY, user_id UUID REFERENCES users(id), device_type VARCHAR(100), issue_description TEXT, status VARCHAR(50) DEFAULT 'pending', estimated_cost DECIMAL(10,2), assigned_to UUID REFERENCES users(id), notes TEXT, completed_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);
        await query(`CREATE TABLE IF NOT EXISTS bank_settings (id SERIAL PRIMARY KEY, bank_key VARCHAR(50) UNIQUE NOT NULL, bank_name VARCHAR(100) NOT NULL, account_number VARCHAR(100) NOT NULL, account_name VARCHAR(100) NOT NULL, is_active BOOLEAN DEFAULT true, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW())`);

        // Seed roles
        await query(`INSERT INTO roles (name) VALUES ('admin'),('manager'),('customer'),('technician') ON CONFLICT (name) DO NOTHING`);

        // Seed categories
        await query(`INSERT INTO categories (name, slug) VALUES ('Cases','cases'),('Screen Protectors','screen-protectors'),('Chargers','chargers'),('Audio','audio'),('Power Banks','power-banks'),('Smart Watches','smart-watches'),('Repair Services','repair-services') ON CONFLICT (slug) DO NOTHING`);

        // Seed bank settings
        await query(`INSERT INTO bank_settings (bank_key, bank_name, account_number, account_name, is_active) VALUES ('cbe','Commercial Bank of Ethiopia','1000123456789','Nancy Mobile PLC',true),('abyssinia','Bank of Abyssinia','0123456789','Nancy Mobile PLC',true),('awash','Awash Bank','0123456789012','Nancy Mobile PLC',true) ON CONFLICT (bank_key) DO NOTHING`);

        // Safe column migrations
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'unverified'`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id VARCHAR(100)`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS fan_number VARCHAR(100)`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_picture VARCHAR(255)`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS national_id_file VARCHAR(255)`);
        await query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
        await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(255)`);
        await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS receipt_url VARCHAR(255)`);
        await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP`);
        await query(`ALTER TABLE payments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()`);
        await query(`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`);
        await query(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS assigned_to UUID`);
        await query(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS notes TEXT`);
        await query(`ALTER TABLE repairs ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`);

        const colsResult = await query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position`);
        res.json({ success: true, message: 'Database setup and migrations complete', user_columns: colsResult.rows.map(r => r.column_name) });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET endpoint - visit this URL in browser to create admin
router.get('/init', async (req, res) => {
    try {
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');

        // Seed roles
        await query(`INSERT INTO roles (name) VALUES ('admin'),('manager'),('customer'),('technician') ON CONFLICT (name) DO NOTHING`);

        // Seed categories
        await query(`INSERT INTO categories (name, slug) VALUES ('Cases','cases'),('Screen Protectors','screen-protectors'),('Chargers','chargers'),('Audio','audio'),('Power Banks','power-banks'),('Smart Watches','smart-watches'),('Repair Services','repair-services') ON CONFLICT (slug) DO NOTHING`);

        // Seed bank settings
        await query(`INSERT INTO bank_settings (bank_key, bank_name, account_number, account_name, is_active) VALUES ('cbe','Commercial Bank of Ethiopia','1000123456789','Nancy Mobile PLC',true),('abyssinia','Bank of Abyssinia','0123456789','Nancy Mobile PLC',true),('awash','Awash Bank','0123456789012','Nancy Mobile PLC',true) ON CONFLICT (bank_key) DO NOTHING`);

        // Delete old admin and recreate with correct password
        const hash = await bcrypt.hash('admin@123', 10);
        await query(`DELETE FROM users WHERE email = 'Namcy@gmail.com'`);
        const adminRole = await query(`SELECT id FROM roles WHERE name = 'admin'`);
        await query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, is_active, is_verified, verification_status, created_at) VALUES ($1, $2, $3, $4, $5, $6, true, true, 'verified', NOW())`,
            [uuidv4(), 'Namcy@gmail.com', hash, 'Nancy', 'Admin', adminRole.rows[0].id]
        );

        const roles = await query(`SELECT * FROM roles`);
        const users = await query(`SELECT email, is_active, is_verified FROM users`);

        res.send(`
            <h2>Setup Complete!</h2>
            <p><b>Admin created:</b> Namcy@gmail.com / admin@123</p>
            <p><b>Roles:</b> ${roles.rows.map(r => r.name).join(', ')}</p>
            <p><b>Users:</b> ${users.rows.map(u => u.email).join(', ')}</p>
            <p><a href="/">Go to App</a></p>
        `);
    } catch (err) {
        res.status(500).send('<h2>Error: ' + err.message + '</h2>');
    }
});
    const secret = req.headers['x-setup-secret'];
    if (secret !== 'nancy-setup-2024') {
        return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    try {
        const bcrypt = require('bcryptjs');
        const { v4: uuidv4 } = require('uuid');

        // Ensure ALL roles exist first
        await query(`INSERT INTO roles (name) VALUES ('admin'),('manager'),('customer'),('technician') ON CONFLICT (name) DO NOTHING`);

        // Ensure categories exist
        await query(`INSERT INTO categories (name, slug) VALUES ('Cases','cases'),('Screen Protectors','screen-protectors'),('Chargers','chargers'),('Audio','audio'),('Power Banks','power-banks'),('Smart Watches','smart-watches'),('Repair Services','repair-services') ON CONFLICT (slug) DO NOTHING`);

        // Ensure bank settings exist
        await query(`INSERT INTO bank_settings (bank_key, bank_name, account_number, account_name, is_active) VALUES ('cbe','Commercial Bank of Ethiopia','1000123456789','Nancy Mobile PLC',true),('abyssinia','Bank of Abyssinia','0123456789','Nancy Mobile PLC',true),('awash','Awash Bank','0123456789012','Nancy Mobile PLC',true) ON CONFLICT (bank_key) DO NOTHING`);

        const adminRole = await query(`SELECT id FROM roles WHERE name = 'admin'`);
        const rolesAll = await query(`SELECT * FROM roles`);

        const hash = await bcrypt.hash('admin@123', 10);

        // Delete existing and recreate
        await query(`DELETE FROM users WHERE email = 'Namcy@gmail.com'`);
        await query(
            `INSERT INTO users (id, email, password_hash, first_name, last_name, role_id, is_active, is_verified, verification_status, created_at)
             VALUES ($1, $2, $3, 'Nancy', 'Admin', $4, true, true, 'verified', NOW())`,
            [uuidv4(), 'Namcy@gmail.com', hash, adminRole.rows[0].id]
        );

        res.json({
            success: true,
            message: 'Done! Email: Namcy@gmail.com / Password: admin@123',
            roles: rolesAll.rows
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;