/**
 * LifeLink Twin - Cloud Server
 * 
 * This Express server acts as the cloud backend:
 * 
 * 1. Subscribes to processed MQTT data from edge
 * 2. Stores latest patient data in memory
 * 3. Serves the static dashboard files
 * 4. Sends real-time updates via WebSocket (Socket.io)
 * 
 * MQTT Topic: lifelink/patient1/processed
 * WebSocket Events: 'vitals-update', 'patient-status'
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mqtt = require('mqtt');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session');

// Import authentication module
const {
    createDefaultUsers,
    authenticateUser,
    registerUser,
    authMiddleware,
} = require('./auth');

// Configuration
const PORT = 3000;
const MQTT_BROKER = 'mqtt://localhost:1883';
const MQTT_TOPIC = 'lifelink/patient1/processed';

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io for real-time WebSocket communication
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for hackathon demo
        methods: ["GET", "POST"]
    }
});

// In-memory storage for patient data
// In production, this would be a database
const patientData = new Map();

// History for charts (last 60 data points = ~1 minute)
const vitalHistory = {
    patient1: {
        timestamps: [],
        heartRate: [],
        spo2: [],
        temperature: []
    }
};
const MAX_HISTORY = 60;

// Middleware
app.use(express.json());
app.use(cookieParser());

// CORS middleware for dashboard
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'lifelink-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Initialize default users
createDefaultUsers();

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// ==================== Authentication Routes ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }

    const result = await authenticateUser(username, password);

    if (result.success) {
        // Store user in session
        req.session.user = result.user;
        req.session.token = result.token;
        req.session.loginTime = new Date().toISOString();

        // Set token in cookie
        res.cookie('token', result.token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        console.log(`🔐 User logged in: ${username} (${result.user.role})`);
    }

    res.json(result);
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
    const result = await registerUser(req.body);

    if (result.success) {
        console.log(`👤 New user registered: ${req.body.username}`);
    }

    res.json(result);
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
    // Destroy session
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
    });
    res.clearCookie('token');
    res.clearCookie('connect.sid'); // Clear session cookie
    res.json({ success: true, message: 'Logged out successfully' });
});

// Get current user
app.get('/api/auth/me', authMiddleware, (req, res) => {
    res.json({
        success: true,
        user: req.user,
        session: {
            loginTime: req.session?.loginTime,
            active: !!req.session?.user
        }
    });
});

// Get session info
app.get('/api/auth/session', (req, res) => {
    if (req.session?.user) {
        res.json({
            success: true,
            active: true,
            user: req.session.user,
            loginTime: req.session.loginTime
        });
    } else {
        res.json({
            success: false,
            active: false,
            message: 'No active session'
        });
    }
});

// ==================== Protected API Routes ====================

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// REST API endpoint to get current patient data
app.get('/api/patient/:id', authMiddleware, (req, res) => {
    const patientId = req.params.id;
    const data = patientData.get(patientId);

    if (data) {
        res.json({
            success: true,
            data: data,
            history: vitalHistory[patientId] || null
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Patient not found'
        });
    }
});

// REST API endpoint to get all patients
app.get('/api/patients', authMiddleware, (req, res) => {
    const patients = Array.from(patientData.values());
    res.json({
        success: true,
        count: patients.length,
        patients: patients
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mqtt: mqttClient.connected ? 'connected' : 'disconnected',
        clients: io.engine.clientsCount
    });
});

// Connect to MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
    console.log('🌐 Cloud Server connected to MQTT broker');
    console.log(`📥 Subscribing to: ${MQTT_TOPIC}`);

    mqttClient.subscribe(MQTT_TOPIC, (err) => {
        if (err) {
            console.error('❌ MQTT Subscribe error:', err);
        } else {
            console.log('✅ MQTT subscription active');
        }
    });
});

// Handle incoming MQTT messages
mqttClient.on('message', (topic, message) => {
    try {
        const data = JSON.parse(message.toString());

        // Store latest data
        patientData.set(data.patientId, data);

        // Update history for charts
        updateHistory(data);

        // Broadcast to all connected WebSocket clients
        io.emit('vitals-update', {
            patient: data,
            history: vitalHistory[data.patientId]
        });

        // Send separate status event for critical alerts
        if (data.status !== 'normal') {
            io.emit('patient-alert', {
                patientId: data.patientId,
                patientName: data.patientName,
                status: data.status,
                alerts: data.alerts,
                timestamp: data.timestamp
            });
        }

        // Console log for monitoring
        const statusEmoji = {
            'normal': '🟢',
            'warning': '🟡',
            'critical': '🔴'
        };
        console.log(`[${new Date().toLocaleTimeString()}] ${statusEmoji[data.status]} ${data.patientId}: HR=${data.vitals.heartRate} SpO2=${data.vitals.spo2}% Temp=${data.vitals.temperature}°C`);

    } catch (error) {
        console.error('❌ Error processing MQTT message:', error.message);
    }
});

/**
 * Update vital history for charts
 * @param {object} data - Processed vital data
 */
function updateHistory(data) {
    const patientId = data.patientId;

    // Initialize if not exists
    if (!vitalHistory[patientId]) {
        vitalHistory[patientId] = {
            timestamps: [],
            heartRate: [],
            spo2: [],
            temperature: []
        };
    }

    const history = vitalHistory[patientId];

    // Add new data point
    history.timestamps.push(new Date(data.timestamp).toLocaleTimeString());
    history.heartRate.push(data.vitals.heartRate);
    history.spo2.push(data.vitals.spo2);
    history.temperature.push(data.vitals.temperature);

    // Keep only last MAX_HISTORY points
    if (history.timestamps.length > MAX_HISTORY) {
        history.timestamps.shift();
        history.heartRate.shift();
        history.spo2.shift();
        history.temperature.shift();
    }
}

// WebSocket connection handler
io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Send current data to newly connected client
    const patients = Array.from(patientData.values());
    if (patients.length > 0) {
        socket.emit('initial-data', {
            patients: patients,
            history: vitalHistory
        });
    }

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
    });

    // Handle client requesting specific patient data
    socket.on('subscribe-patient', (patientId) => {
        console.log(`📡 Client ${socket.id} subscribed to ${patientId}`);
        socket.join(patientId);
    });
});

// MQTT error handler
mqttClient.on('error', (error) => {
    console.error('❌ MQTT Error:', error.message);
});

// Start server
server.listen(PORT, () => {
    console.log('===========================================');
    console.log('   🏥 LifeLink Twin Cloud Server');
    console.log('===========================================');
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📊 Dashboard: http://localhost:${PORT}`);
    console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
    console.log('===========================================\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    mqttClient.end();
    io.close();
    server.close();
    process.exit();
});
