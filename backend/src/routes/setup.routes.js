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

module.exports = router;