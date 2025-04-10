const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const uploadRoutes = require('./routes/upload.routes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:8100', // cambiar puerto en producción
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/upload', uploadRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('🎧 Tu API de audioguías está funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
