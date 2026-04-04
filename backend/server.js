require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const https = require('https');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const carRoutes = require('./routes/carRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const customerRoutes = require('./routes/customerRoutes');
const offerRoutes = require('./routes/offerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Connect to database
connectDB();

const app = express();

// Security Logging Middleware
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 429) {
      const ip = req.ip || req.connection?.remoteAddress || 'unknown';
      console.log(`[SECURITY] [${new Date().toISOString()}] ${res.statusCode} ${req.method} ${req.originalUrl} - IP: ${ip}`);
    }
    return originalSend.apply(res, arguments);
  };
  next();
});

// Security Middleware
const isHttpsConfigured = process.env.USE_HTTPS === 'true' || process.env.NODE_ENV === 'production';
app.use(helmet({ 
  contentSecurityPolicy: false, // Relaxed for local dev/Cloudinary; noted as DevOps gap
  hsts: isHttpsConfigured ? { maxAge: 31536000, includeSubDomains: true } : false,
  frameguard: { action: 'deny' },
  xContentTypeOptions: true
}));

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  optionsSuccessStatus: 200
})); 

const rateLimit = require('express-rate-limit');
const isLocalIp = (ip = '') => ['::1', '127.0.0.1', '::ffff:127.0.0.1'].includes(ip);
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  skip: (req) => process.env.NODE_ENV !== 'production' && isLocalIp(req.ip),
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' }
});
app.use('/api', apiLimiter);

// Parsing Middleware
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.send('Car Showroom API is running...');
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');

if (process.env.USE_HTTPS === 'true') {
  const certPath = process.env.SSL_CERT_PATH;
  const keyPath = process.env.SSL_KEY_PATH;
  
  if (certPath && keyPath && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    const httpsOptions = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath)
    };
    https.createServer(httpsOptions, app).listen(PORT, HOST, () => {
      console.log(`HTTPS Server running on https://${HOST}:${PORT}`);
    });
  } else {
    console.warn('[SECURITY WARNING] USE_HTTPS is true but SSL certificates are missing or invalid paths. Falling back to HTTP.');
    app.listen(PORT, HOST, () => console.log(`HTTP Server (Fallback) running on http://${HOST}:${PORT}`));
  }
} else {
  app.listen(PORT, HOST, () => console.log(`HTTP Server running on http://${HOST}:${PORT}`));
}
