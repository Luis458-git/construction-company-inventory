const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { initDatabase } = require('./src/config/database');

const materialRoutes = require('./src/routes/materialRoutes');
const movimientoRoutes = require('./src/routes/movimientoRoutes');
const alertaRoutes = require('./src/routes/alertaRoutes');
const ordenRoutes = require('./src/routes/ordenRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Inicializar BD
initDatabase();

// Rutas API
app.use('/api/materiales', materialRoutes);
app.use('/api/movimientos', movimientoRoutes);
app.use('/api/alertas', alertaRoutes);
app.use('/api/ordenes', ordenRoutes);

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), version: '2.4' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ error: 'Internal Server Error', mensaje: err.message });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor Constructora Del Valle corriendo en http://localhost:${PORT}`);
    console.log(`📦 API disponible en http://localhost:${PORT}/api`);
  });
}

module.exports = app;
