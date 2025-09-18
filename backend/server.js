import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express(); // ← You MUST define app first

app.use(cors());
app.use(express.json());

// PostgreSQL pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});



// Signup Route
app.post("/api/signup", async (req, res) => {
  const { name, address, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO users (name, address, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, address, email, password, role]
    );
    res.json({ message: "User registered successfully", user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});



// Login Route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];
    res.json({
      message: "Login successful",
      user: { id: user.id, role: user.role, email: user.email },
      token: "dummy-jwt-token", // replace later with real JWT
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all stores with average rating
app.get("/api/stores", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id, s.name, s.address, s.owner_id, 
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
      ORDER BY s.id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Get all users with their stores and ratings
app.get("/api/admin/users", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id AS user_id,
        u.name AS user_name,
        u.email,
        u.address,
        u.role,
        s.id AS store_id,
        s.name AS store_name,
        s.address AS store_address,
        COALESCE(AVG(r.rating), 0) AS average_rating,
        COUNT(r.id) AS total_ratings
      FROM users u
      LEFT JOIN stores s ON u.id = s.owner_id
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY u.id, s.id
      ORDER BY u.id;
    `);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Add or update a rating
app.post("/api/rate", async (req, res) => {
  const { user_id, store_id, rating } = req.body;

  if (!user_id || !store_id || !rating) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check if user already rated this store
    const existing = await pool.query(
      "SELECT * FROM ratings WHERE user_id=$1 AND store_id=$2",
      [user_id, store_id]
    );

    if (existing.rows.length > 0) {
      // Update rating
      await pool.query(
        "UPDATE ratings SET rating=$1 WHERE user_id=$2 AND store_id=$3",
        [rating, user_id, store_id]
      );
    } else {
      // Insert rating
      await pool.query(
        "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)",
        [user_id, store_id, rating]
      );
    }

    res.json({ message: "Rating submitted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


