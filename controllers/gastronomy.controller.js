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
            googleMapsUrl: true,
            views: true,
            cityId: true,
            translations: {
              where: { language: lang },
              select: {
                name: true,
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
            locationUrl: restaurants.googleMapsUrl,
            views: restaurants.views,
            name: restaurants.translations[0].name,
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
