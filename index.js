const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: 'http://localhost:8100',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Rutas
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const cityRoutes = require('./routes/city.routes');
const uploadRoutes = require('./routes/upload.routes');
const experienceRoutes = require('./routes/experience.routes');
const gastronomyRoutes = require('./routes/gastronomy.routes');
const placeRoutes = require('./routes/place.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const locationRoutes = require('./routes/location.routes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/upload', uploadRoutes);
app.use('/cities', cityRoutes);
app.use('/experiences', experienceRoutes);
app.use('/gastronomy', gastronomyRoutes);
app.use('/place', placeRoutes);
app.use('/favorite', favoriteRoutes);
app.use('/api/location', locationRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('🎧 Tu API de audioguías está funcionando correctamente');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
