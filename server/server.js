import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise.js';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

function parseDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL);
      return {
        host: url.hostname,
        port: url.port ? Number(url.port) : 3306,
        user: decodeURIComponent(url.username),
        password: decodeURIComponent(url.password),
        database: url.pathname ? url.pathname.replace(/^\//, '') : undefined,
      };
    } catch (err) {
      console.error('Failed to parse DATABASE_URL:', err.message);
    }
  }

  return {
    host: process.env.DB_HOST || 'mysql.railway.internal',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'projectdnd',
  };
}

const dbConfig = parseDatabaseConfig();

const pool = mysql.createPool({
  host: dbConfig.host,
  port: dbConfig.port,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

pool.getConnection()
  .then(conn => {
    console.log('✓ MySQL connected successfully');
    conn.release();
  })
  .catch(err => {
    console.error('✗ MySQL connection failed:', err.message);
  });


app.post('/api/query', async (req, res) => {
  try {
    const { sql, params = [] } = req.body;

    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.execute(sql, params);
    connection.release();

    res.json({
      success: true,
      result: {
        resultRows: rows.map(row => Object.values(row))
      }
    });
  } catch (error) {
    console.error('Query error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});


app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT * FROM Usuario WHERE nombre = ? AND contrasenya = ?',
      [username, password]
    );
    connection.release();

    if (rows.length > 0) {
      res.json({ success: true, userId: rows[0].id, user: rows[0] });
    } else {
      res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Usuario (nombre, contrasenya) VALUES (?, ?)',
      [username, password]
    );
    connection.release();

    res.json({ success: true, userId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/users/:id/name', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      'SELECT nombre FROM Usuario WHERE id = ?',
      [req.params.id]
    );
    connection.release();

    if (rows.length > 0) {
      res.json({ success: true, nombre: rows[0].nombre });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/characters/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT
        p.id,
        p.nombre,
        p.personajeNivel,
        p.health,
        p.maxHealth,
        c.id,
        c.nombre,
        s.str,
        s.dex,
        s.con,
        s.int,
        s.wis,
        s.cha,
        ca.id,
        ca.nombre
      FROM Personaje p
      JOIN Stats s ON p.personajeStats = s.id
      LEFT JOIN Clase c ON p.personajeClase = c.id
      LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
      LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
      WHERE p.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (rows.length > 0) {
      res.json({ success: true, character: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Character not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/characters/user/:userId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT
        p.id,
        p.nombre,
        p.personajeNivel,
        c.nombre,
        ca.nombre
      FROM Personaje p
      LEFT JOIN Clase c ON p.personajeClase = c.id
      LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
      LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
      WHERE p.personajeUsuario = ?`,
      [req.params.userId]
    );
    connection.release();

    res.json({ success: true, characters: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns/:campaignId/characters', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT
        p.id,
        p.nombre,
        p.personajeNivel,
        c.nombre,
        ca.nombre
      FROM Personaje p
      LEFT JOIN Clase c ON p.personajeClase = c.id
      LEFT JOIN Campanya_tiene_Personaje chp ON p.id = chp.Personaje_id
      LEFT JOIN Campanya ca ON chp.Campanya_id = ca.id
      WHERE chp.Campanya_id = ?`,
      [req.params.campaignId]
    );
    connection.release();

    res.json({ success: true, characters: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/characters', async (req, res) => {
  try {
    const { nombre, nivel, health, clase, stats, usuario } = req.body;
    const connection = await pool.getConnection();

    const [statsResult] = await connection.execute(
      `INSERT INTO Stats (str, dex, con, int, wis, cha) VALUES (?, ?, ?, ?, ?, ?)`,
      [stats.str, stats.dex, stats.con, stats.int, stats.wis, stats.cha]
    );

    const [charResult] = await connection.execute(
      `INSERT INTO Personaje (nombre, personajeNivel, health, maxHealth, personajeClase, personajeStats, personajeUsuario) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [nombre, nivel, health, health, clase, statsResult.insertId, usuario]
    );

    connection.release();

    res.json({ success: true, characterId: charResult.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns/:id', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT
        c.id,
        c.nombre,
        c.campanyaDM,
        u.nombre
      FROM Campanya c
      LEFT JOIN Usuario u ON c.campanyaDM = u.id
      WHERE c.id = ?`,
      [req.params.id]
    );
    connection.release();

    if (rows.length > 0) {
      res.json({ success: true, campaign: rows[0] });
    } else {
      res.status(404).json({ success: false, error: 'Campaign not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns/user/:userId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT c.id, c.nombre, u.nombre FROM Campanya c
       LEFT JOIN Usuario u ON c.campanyaDM = u.id
       WHERE campanyaDM = ?`,
      [req.params.userId]
    );
    connection.release();

    res.json({ success: true, campaigns: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/campaigns/available/:userId', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.execute(
      `SELECT c.id, c.nombre, u.nombre FROM Campanya c
       LEFT JOIN Usuario u ON c.campanyaDM = u.id
       WHERE campanyaDM != ?`,
      [req.params.userId]
    );
    connection.release();

    res.json({ success: true, campaigns: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  try {
    const { userId } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO Campanya (nombre, campanyaDM) VALUES (?, ?)',
      ['New Campaign', userId]
    );
    connection.release();

    res.json({ success: true, campaignId: result.insertId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/campaigns/:campaignId/add-character/:characterId', async (req, res) => {
  try {
    const { campaignId, characterId } = req.params;
    const connection = await pool.getConnection();
    
    await connection.execute(
      `INSERT IGNORE INTO Campanya_tiene_Personaje (Campanya_id, Personaje_id)
       VALUES (?, ?)`,
      [campaignId, characterId]
    );
    connection.release();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

const distPath = path.resolve(process.cwd(), 'dist');
try {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Static frontend serving enabled from', distPath);
} catch (err) {
  console.log('Static frontend not available:', err.message);
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DB host: ${dbConfig.host} (port ${dbConfig.port}), DB name: ${dbConfig.database}`);
});
