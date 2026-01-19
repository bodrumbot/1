// server.js
const express = require('express');
const mysql   = require('mysql2/promise');
const cors    = require('cors');
const app     = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host     : 'localhost',
  user     : 'root',
  password : 'YOUR_PASSWORD',
  database : 'bodrum'
});

// 1. Mahsulotlar
app.get('/api/products', async (_, res) => {
  const [rows] = await pool.query('SELECT * FROM products');
  res.json(rows);
});

// 2. Buyurtma qo‘shish
app.post('/api/order', async (req, res) => {
  const { tg_id, name, phone, items, total, location } = req.body;
  try {
    // user (insert or ignore)
    await pool.query(
      `INSERT INTO users (tg_id, name, phone) VALUES (?,?,?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), phone=VALUES(phone)`,
      [tg_id, name, phone]
    );
    const [user] = await pool.query('SELECT id FROM users WHERE tg_id=?', [tg_id]);

    // order
    await pool.query(
      `INSERT INTO orders (user_id, items, total, location)
       VALUES (?,?,?,?)`,
      [user[0].id, JSON.stringify(items), total, location]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false });
  }
});

// 3. Admin: bugungi buyurtmalar
app.get('/api/admin/orders', async (_, res) => {
  const [rows] = await pool.query(
    `SELECT o.id, u.name, u.phone, o.items, o.total, o.location, o.created_at
     FROM orders o
     JOIN users u ON u.id = o.user_id
     WHERE DATE(o.created_at) = CURDATE()
     ORDER BY o.created_at DESC`
  );
  res.json(rows);
});

app.listen(4000, () => console.log('SQL server 4000-portda'));