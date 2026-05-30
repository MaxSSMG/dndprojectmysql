import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mysql from 'mysql2/promise.js';
import { escape } from 'mysql2';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the built frontend
app.use(express.static(join(__dirname, '../dist')));

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***' : 'undefined');
console.log('DB_NAME:', process.env.DB_NAME);

// API Routes
app.post('/api/query', async (req, res) => {
  try {
    const { query, params = [] } = req.body;
    console.log('Received query:', query);
    console.log('Received params:', params);
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Manually substitute ? placeholders with escaped values so MySQL
    // receives a fully-formed query string with no literal ? characters.
    let paramIndex = 0;
    const interpolatedQuery = query.replace(/\?/g, () => {
      if (paramIndex >= params.length) {
        throw new Error('Not enough parameters provided for query placeholders');
      }
      return escape(params[paramIndex++]);
    });

    const connection = await pool.getConnection();
    const [results] = await connection.query(interpolatedQuery);
    connection.release();

    let resultPayload;
    if (Array.isArray(results)) {
      resultPayload = {
        resultRows: results.map(row => Object.values(row)),
      };
    } else {
      resultPayload = {
        insertId: results.insertId,
        affectedRows: results.affectedRows,
        warningStatus: results.warningStatus,
      };
    }

    res.json({ success: true, result: resultPayload });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Serve frontend for all other routes (SPA fallback)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

