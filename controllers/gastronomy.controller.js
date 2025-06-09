const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTopVisitedGastronomy = async (req, res) => {
  const lang = req.query.lang;
  const number = parseInt(req.query.number);
  const color = 'blue';

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
      color
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
  const color = 'blue';

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
      color
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getTopRestaurantsByCity = async (req, res) => {
  const { lang } = req.query;
  const color = 'blue';

  if (!lang) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos: cityId o lang' });
  }

  try {
    const cities = await prisma.city.findMany({
      select: { id: true }
    });

    const results = await Promise.all(
      cities.map(async city => {
        const restaurants = await prisma.restaurant.findFirst({
          where: {
            cityId: city.id,
            translations: { some: { language: lang } }
          },
          orderBy: { views: 'desc' },
          select: {
            id: true,
            imageUrl: true,
            link: true,
            googleMapsUrl: true,
            views: true,
            cityId: true,
            translations: {
              where: { language: lang },
              select: {
                name: true,
                cityName: true,
                description: true,
                audioUrl: true,
                secondInfo: true,
                thirdInfo: true,
                firstInfo: true
              }
            }
          }
        });

        if (restaurants && restaurants.translations.length > 0) {
          return {
            id: restaurants.id,
            cityId: restaurants.cityId,
            imageUrl: restaurants.imageUrl,
            link: restaurants.link,
            locationUrl: restaurants.googleMapsUrl,
            views: restaurants.views,
            name: restaurants.translations[0].name,
            cityName: restaurants.translations[0].cityName,
            description: restaurants.translations[0].description,
            audioUrl: restaurants.translations[0].audioUrl,
            secondInfo: restaurants.translations[0].secondInfo,
            thirdInfo: restaurants.translations[0].thirdInfo,
            firstInfo: restaurants.translations[0].firstInfo,
            color
          };
        } else {
          return null;
        }
      })
    );

    res.json(results.filter(x => x !== null));
  } catch (error) {
    console.error('Error al obtener las experiencias más visitados por ciudad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.getRestaurantsByIds = async (req, res) => {
  const { restaurantIds, lang } = req.body;
  const color = 'blue';

  if (!Array.isArray(restaurantIds) || restaurantIds.length === 0) {
    return res.status(400).json({ message: 'La lista de IDs es inválida o está vacía' });
  }

  try {
    const restaurants = await prisma.restaurant.findMany({
      where: {
        id: { in: restaurantIds },
        translations: {
          some: { language: lang }
        }
      },
      include: {
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
            name: true,
            cityName: true,
            description: true,
            audioUrl: true,
            info: true,
            firstInfo: true,
            secondInfo: true,
            thirdInfo: true
          }
        }
      }
    });

    const response = restaurants.map(restaurant => {
      const t = restaurant.translations[0] || {};
      const cityName = restaurant.city.translations[0]?.name || null;

      return {
        id: restaurant.id,
        cityId: restaurant.cityId,
        city: {
          id: restaurant.city.id,
          name: cityName
        },
        imageUrl: restaurant.imageUrl,
        googleMapsUrl: restaurant.googleMapsUrl || null,
        views: restaurant.views,
        name: t.name || null,
        cityName: t.cityName || null,
        description: t.description || null,
        audioUrl: t.audioUrl || null,
        info: t.info || null,
        firstInfo: t.firstInfo || null,
        secondInfo: t.secondInfo || null,
        thirdInfo: t.thirdInfo || null,
        color
      };
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Error al obtener restaurantes por IDs:', error);
    res.status(500).json({ message: 'Error al obtener restaurantes' });
  }
};

exports.getRestaurantsNear = async (req, res) => {
  const { lang, latitude, longitude } = req.query;
  const RADIUS_KM = 60;

  if (!lang || !latitude || !longitude) {
    return res.status(400).json({ message: 'Faltan parámetros' });
  }

  let userId = null;

  // 🔒 Autenticación (opcional)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.warn('Token inválido:', err.message);
    }
  }

  try {
    // 🔥 Filtrar las cities cercanas usando Haversine
    const nearbyCities = await prisma.$queryRawUnsafe(`
      SELECT id
      FROM "City"
      WHERE (
        6371 * acos(
          cos(radians(CAST(${latitude} AS float))) *
          cos(radians(CAST(latitude AS float))) *
          cos(radians(CAST(longitude AS float)) - radians(CAST(${longitude} AS float))) +
          sin(radians(CAST(${latitude} AS float))) *
          sin(radians(CAST(latitude AS float)))
        )
      ) <= ${RADIUS_KM}
    `);

    const nearbyCityIds = nearbyCities.map(c => c.id);

    if (nearbyCityIds.length === 0) {
      return res.json([]); // No hay ciudades cercanas
    }

    // 🔍 Buscar los restaurantes de esas ciudades con traducciones
    const restaurants = await prisma.restaurant.findMany({
      where: {
        cityId: { in: nearbyCityIds },
        translations: {
          some: { language: lang }
        }
      },
      include: {
        city: {
          select: {
            id: true,
            cityPrice: true,
            translations: {
              where: { language: lang },
              select: { name: true }
            }
          }
        },
        translations: {
          where: { language: lang },
          select: {
            name: true,
            description: true,
            audioUrl: true,
            info: true,
            firstInfo: true,
            secondInfo: true,
            thirdInfo: true
          }
        }
      }
    });

    // 🔥 Construir la respuesta
    const response = restaurants.map(restaurant => {
      const t = restaurant.translations[0] || {};
      const cityTranslation = restaurant.city?.translations?.[0]?.name || null;

      return {
        id: restaurant.id,
        cityId: restaurant.cityId,
        city: {
          id: restaurant.cityId,
          name: cityTranslation
        },
        cityPrice: restaurant.city.cityPrice,
        imageUrl: restaurant.imageUrl,
        link: restaurant.link,
        views: restaurant.views,
        name: t.name || null,
        description: t.description || null,
        info: t.info || null,
        firstInfo: t.firstInfo || null,
        secondInfo: t.secondInfo || null,
        thirdInfo: t.thirdInfo || null,
        audioUrl: t.audioUrl || null
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error al obtener restaurantes cercanos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


