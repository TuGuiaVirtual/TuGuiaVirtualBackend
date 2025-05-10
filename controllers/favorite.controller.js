const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.toggleFavorite = async (req, res) => {
    const userId = req.user.id;
    const { type, itemId } = req.body;
  
    if (!['places', 'cities', 'restaurants', 'experiences'].includes(type) || itemId === undefined || itemId === null) {
      return res.status(400).json({ message: 'Parámetros inválidos' });
    }
  
    const modelMap = {
      places: 'favoritePlace',
      cities: 'favoriteCity',
      restaurants: 'favoriteRestaurant',
      experiences: 'favoriteExperience'
    };
  
    const fieldMap = {
      places: 'placeId',
      cities: 'cityId',
      restaurants: 'restaurantId',
      experiences: 'experienceId'
    };
  
    const where = {
      userId,
      [fieldMap[type]]: itemId
    };
  
    try {
      const existing = await prisma[modelMap[type]].findFirst({ where });
  
      if (existing) {
        await prisma[modelMap[type]].delete({ where: { id: existing.id } });
        return res.json({ message: `${type} eliminado de favoritos` });
      } else {
        await prisma[modelMap[type]].create({ data: where });
        return res.json({ message: `${type} añadido a favoritos` });
      }
  
    } catch (error) {
      console.error('Error con favoritos:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  };

  exports.getFavorites = async (req, res) => {
    const userId = req.user.id;
    const lang = req.query.lang || 'es';
  
    try {
      const favoriteCities = await prisma.favoriteCity.findMany({
        where: { userId },
        select: { cityId: true }
      });
  
      const favoritePlaces = await prisma.favoritePlace.findMany({
        where: { userId },
        select: { placeId: true }
      });
  
      const favoriteRestaurants = await prisma.favoriteRestaurant.findMany({
        where: { userId },
        select: { restaurantId: true }
      });
  
      const favoriteExperiences = await prisma.favoriteExperience.findMany({
        where: { userId },
        select: { experienceId: true }
      });
  
      const cities = await prisma.city.findMany({
        where: { id: { in: favoriteCities.map(f => f.cityId) } },
        include: {
          translations: {
            where: { language: lang }
          }
        }
      });
  
      const places = await prisma.place.findMany({
        where: { id: { in: favoritePlaces.map(f => f.placeId) } },
        include: {
          translations: {
            where: { language: lang }
          },
          city: true
        }
      });
  
      const restaurants = await prisma.restaurant.findMany({
        where: { id: { in: favoriteRestaurants.map(f => f.restaurantId) } },
        include: {
          translations: {
            where: { language: lang }
          },
          city: true
        }
      });
  
      const experiences = await prisma.experience.findMany({
        where: { id: { in: favoriteExperiences.map(f => f.experienceId) } },
        include: {
          translations: {
            where: { language: lang }
          },
          city: true
        }
      });
  
      res.json({
        cities,
        places,
        restaurants,
        experiences
      });
  
    } catch (error) {
      console.error('Error al obtener favoritos:', error);
      res.status(500).json({ message: 'Error al obtener favoritos' });
    }
  };
  
  
  
