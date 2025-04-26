const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTopVisitedGastronomy = async (req, res) => {
  const lang = req.query.lang;
  const number = parseInt(req.query.number);

  if (!lang || isNaN(number)) {
    return res.status(400).json({ message: 'Falta el parámetro lang' });
  }

  try {
    const topCities = await prisma.city.findMany({
      orderBy: { views: 'desc' },
      take: number,
      select: { id: true }
    });

    const restaurantPromises = topCities.map(city =>
      prisma.restaurant.findFirst({
        where: { cityId: city.id },
        orderBy: { views: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          link: true,
          latitude: true,
          longitude: true,
          googleMapsUrl: true,
          city: {
            select: {
              id: true,
              translations: {
                where: { language: lang },
                select: { name: true }
              }
            }
          },
          translations: {
            where: { language: lang },
            select: {
              audioUrl: true,
              name: true,
              description: true,
              firstInfo: true,
              secondInfo: true,
              thirdInfo: true,
              info: true,
            }
          }
        }
      })
    );

    let restaurants = await Promise.all(restaurantPromises);

    restaurants = restaurants.filter(r => !!r);

    const result = restaurants.map(r => ({
      id: r.id,
      imageUrl: r.imageUrl,
      link: r.link,
      latitude: r.latitude,
      longitude: r.longitude,
      googleMapsUrl: r.googleMapsUrl,
      cityId: r.city?.id || null,
      cityName: r.city?.translations[0]?.name || null,
      name: r.translations[0]?.name || null,
      description: r.translations[0]?.description || null,
      firstInfo: r.translations[0]?.firstInfo || null,
      secondInfo: r.translations[0]?.secondInfo || null,
      thirdInfo: r.translations[0]?.thirdInfo || null,
      info: r.translations[0]?.info || null,
      audioUrl: r.translations[0]?.audioUrl || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener restaurantes populares:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getRestaurants = async (req, res) => {
  const cityId = parseInt(req.query.cityId);
  const lang = req.query.lang;

  if (!cityId || !lang) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos: cityId o lang' });
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: { cityId },
      orderBy: { views: 'desc' },
      select: {
        id: true,
        imageUrl: true,
        link: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        city: {
          select: {
            id: true,
            translations: {
              where: { language: lang },
              select: { name: true }
            }
          }
        },
        translations: {
          where: { language: lang },
          select: {
            audioUrl: true,
            name: true,
            description: true,
            firstInfo: true,
            secondInfo: true,
            thirdInfo: true,
            info: true,
          }
        }
      }
    });

    const result = restaurants.map(r => ({
      id: r.id,
      imageUrl: r.imageUrl,
      link: r.link,
      latitude: r.latitude,
      longitude: r.longitude,
      googleMapsUrl: r.googleMapsUrl,
      cityId: r.city?.id || null,
      cityName: r.city?.translations[0]?.name || null,
      name: r.translations[0]?.name || null,
      description: r.translations[0]?.description || null,
      firstInfo: r.translations[0]?.firstInfo || null,
      secondInfo: r.translations[0]?.secondInfo || null,
      thirdInfo: r.translations[0]?.thirdInfo || null,
      info: r.translations[0]?.info || null,
      audioUrl: r.translations[0]?.audioUrl || null,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

