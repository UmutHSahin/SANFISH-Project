const express = require('express');
const app = express();

const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routers/AuthRouter');
const fishDataRoutes = require('./Routers/fishDataRoutes');
const fishSpeciesRoutes = require('./Routers/fishSpeciesRoutes');
const fishAnalysisRoutes = require('./Routers/fishAnalysisRoutes');
const adminRoutes = require('./Routers/adminRoutes');
const developerRoutes = require('./Routers/developerRoutes');
const partnerRoutes = require('./Routers/partnerRoutes');

require('dotenv').config();
require('./Models/db');

const PORT = process.env.PORT || 8080;

app.get('/ping', (req, res) => {
  res.send('PONG')

});

app.use(bodyParser.json());
app.use(cors());

// Serve static files from uploads directory
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/auth', AuthRouter);
app.use('/api/fish-data', fishDataRoutes);
app.use('/api/fish-species', fishSpeciesRoutes);
app.use('/api', fishAnalysisRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dev', developerRoutes);
app.use('/api/partner', partnerRoutes);

// Global error handler - must be AFTER all routes
app.use((err, req, res, next) => {
  console.error('❌ Global Error Handler:', err);
  console.error('Error stack:', err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? {
      message: err.message,
      stack: err.stack
    } : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});

setInterval(() => {
  console.log('Sunucu hala çalışıyor...');
}, 5000); // Her 5 saniyede bir mesaj yazdır


require('dotenv').config();
require('./Models/db');

// 🧪 TEST: JWT_SECRET yüklendi mi?
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Loaded' : '❌ Missing');
console.log('MONGO_CONN:', process.env.MONGO_CONN ? '✅ Loaded' : '❌ Missing');

