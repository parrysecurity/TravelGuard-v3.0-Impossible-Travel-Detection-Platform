const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const WebSocket = require('ws');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Database connection with proper error handling
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'travelguard',
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
    connectionTimeoutMillis: 5000,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Database connection error:', err.message);
        console.error('Please check your PostgreSQL credentials in .env file');
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('/var/www/travelguard'));

// WebSocket connections
const clients = new Set();
wss.on('connection', (ws) => {
    clients.add(ws);
    ws.on('close', () => clients.delete(ws));
});

function broadcast(data) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', timestamp: Date.now(), database: 'connected' });
    } catch (err) {
        res.json({ status: 'unhealthy', error: err.message });
    }
});

// Get events
app.get('/api/events', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY timestamp DESC LIMIT 500');
        res.json(result.rows);
    } catch (err) {
        console.error('Events error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Add event
app.post('/api/events', async (req, res) => {
    try {
        const { id, userId, city, country, latitude, longitude, ip, device, browser, timestamp } = req.body;
        await pool.query(
            'INSERT INTO events (id, user_id, city, country, latitude, longitude, ip_address, device, browser, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)',
            [id, userId, city, country, latitude, longitude, ip, device, browser, timestamp || Date.now()]
        );
        broadcast({ type: 'NEW_EVENT', event: req.body });
        res.status(201).json({ success: true });
    } catch (err) {
        console.error('Save event error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get alerts
app.get('/api/alerts', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM alerts ORDER BY timestamp DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update alert
app.put('/api/alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { acknowledged } = req.body;
        await pool.query('UPDATE alerts SET acknowledged = $1 WHERE id = $2', [acknowledged, id]);
        broadcast({ type: 'ALERT_UPDATED', alertId: id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Agent heartbeat
app.post('/api/heartbeat', async (req, res) => {
    try {
        const { agent_id, username, ip, timestamp, status } = req.body;
        await pool.query(
            `INSERT INTO agent_heartbeats (agent_id, username, ip_address, last_seen, status) 
             VALUES ($1, $2, $3, $4, $5) 
             ON CONFLICT (agent_id) DO UPDATE SET 
                last_seen = EXCLUDED.last_seen, 
                status = EXCLUDED.status,
                updated_at = CURRENT_TIMESTAMP`,
            [agent_id, username, ip, timestamp, status]
        );
        res.json({ success: true });
    } catch (err) {
        console.error('Heartbeat error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get agents
app.get('/api/agents', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT *, 
                   CASE 
                       WHEN last_seen > EXTRACT(EPOCH FROM NOW() - INTERVAL '5 minutes')*1000 THEN 'online'
                       ELSE 'offline'
                   END as current_status
            FROM agent_heartbeats 
            ORDER BY last_seen DESC
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get whitelist
app.get('/api/whitelist', async (req, res) => {
    try {
        const result = await pool.query('SELECT ip_address FROM whitelist');
        res.json(result.rows.map(r => r.ip_address));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get stats
app.get('/api/stats', async (req, res) => {
    try {
        const totalEvents = await pool.query('SELECT COUNT(*) FROM events');
        const totalAlerts = await pool.query('SELECT COUNT(*) FROM alerts');
        const unackAlerts = await pool.query('SELECT COUNT(*) FROM alerts WHERE acknowledged = false');
        const onlineAgents = await pool.query(`SELECT COUNT(*) FROM agent_heartbeats WHERE last_seen > EXTRACT(EPOCH FROM NOW() - INTERVAL '5 minutes')*1000`);
        
        res.json({
            totalEvents: parseInt(totalEvents.rows[0].count),
            totalAlerts: parseInt(totalAlerts.rows[0].count),
            unackAlerts: parseInt(unackAlerts.rows[0].count),
            onlineAgents: parseInt(onlineAgents.rows[0].count),
            suspiciousEvents: 0
        });
    } catch (err) {
        console.error('Stats error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`\n✅ TravelGuard API Server running on port ${PORT}`);
    console.log(`📡 WebSocket ready for real-time updates\n`);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    pool.end();
    server.close();
    process.exit();
});
