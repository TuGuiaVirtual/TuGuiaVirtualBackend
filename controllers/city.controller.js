const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getIdCity = async (req, res) => {
  const { cityName, lang } = req.query;

  if (!cityName && !lang) {
    return res.status(400).json({ message: 'Faltan parámetros'});
  }

  try {
    const cityId = await prisma.cityTranslation.findFirst({
      where: {
        language: lang,
        name: cityName
      },
      select: {
        cityId: true,
      }
    });

    if (!cityId) {
      return res.status(404).json({ message: 'Id de ciudad no encontrado'})
    }

    res.json(cityId);
  } catch (error) {
    console.error('Error al obtener id de ciudad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.getCityNamesByLanguage = async (req, res) => {
  const { lang } = req.query;

  if (!lang) {
    return res.status(400).json({ message: 'Falta el parámetro lang'});
  }

  try {
    const cities = await prisma.cityTranslation.findMany({
      where: { language: lang },
      select: {
        cityId: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json(cities.map(city => ({
      id: city.cityId,
      name: city.name
    })));
  } catch (error) {
    console.error('Error al obtener nombres de ciudades:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getTopVisitedCities = async (req, res) => {
  const { lang, number } = req.query;
  const numberParsed = parseInt(number);

  if (!lang || isNaN(numberParsed)) {
    return res.status(400).json({ message: 'Faltan parámetros' });
  }

  try {
    const cities = await prisma.city.findMany({
      where: { activated: true },
      orderBy: { views: 'desc' },
      take: numberParsed,
      select: {
        id: true,
        imageUrl: true,
        link: true,
        latitude: true,
        longitude: true,
        googleMapsUrl: true,
        translations: {
          where: { language: lang },
          select: {
            name: true,
            country: true,
            description: true,
            buttonText: true,
            infoCity: true,
            audioUrl: true
          }
        }
      }
    });

    const result = [];

    for (const city of cities) {
      const placesCount = await prisma.placeTranslation.count({
        where: {
          language: lang,
          place: { cityId: city.id }
        }
      });

      const restaurantsCount = await prisma.restaurantTranslation.count({
        where: {
          language: lang,
          restaurant: { cityId: city.id }
        }
      });

      const experiencesCount = await prisma.experienceTranslation.count({
        where: {
          language: lang,
          experience: { cityId: city.id }
        }
      });

      result.push({
        cityId: city.id,
        id: city.id,
        imageUrl: city.imageUrl,
        link: city.link,
        latitude: city.latitude,
        longitude: city.longitude,
        googleMapsUrl: city.googleMapsUrl,
        name: city.translations[0]?.name || null,
        cityName: city.translations[0]?.country || null,
        description: city.translations[0]?.description || null,
        buttonText: city.translations[0]?.buttonText || null,
        infoCity: city.translations[0]?.infoCity || null,
        audioUrl: city.translations[0]?.audioUrl || null,
        placeCount: placesCount,
        restaurantCount: restaurantsCount,
        experienceCount: experiencesCount,
        color: 'blue'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Error al obtener ciudades populares:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


exports.getImageCity = async (req, res) => {
  const { lang, name } = req.query;

  if (!lang || !name) {
    return res.status(400).json({message: 'Faltan parámetros'})
  }

  try {
    const city = await prisma.city.findFirst({
      where: {
        translations: {
          some: {
            name: {
              contains: name,
              mode: 'insensitive',
            },
            language: lang,
          }
        }
      },
      select: {
        imageUrl: true
      }
    });

    if (!city) {
      return res.status(404).json({ message: 'Ciudad no encontrada' });
    }

    res.json({ imageUrl: city.imageUrl });
  } catch (error) {
    console.error('Error al obtener la imagen de la ciudad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
}

exports.getCitiesByIds = async (req, res) => {
  const { cityIds, lang } = req.body;

  if (!Array.isArray(cityIds) || cityIds.length === 0) {
    return res.status(400).json({ message: 'La lista de IDs es inválida o está vacía' });
  }

  try {
    const cities = await prisma.city.findMany({
      where: {
        id: { in: cityIds },
        activated: true,
        translations: {
          some: { language: lang }
        }
      },
      include: {
        translations: {
          where: { language: lang },
          select: {
            name: true,
            country: true,
            audioUrl: true,
            infoCity: true,
            description: true,
            buttonText: true,
          }
        }
      }
    });

    const response = cities.map(city => {
      const t = city.translations[0] || {};
      const color = 'blue';

      return {
        id: city.id,
        cityId: city.id,
        imageUrl: city.imageUrl,
        link: city.link || null,
        views: city.views,
        latitude: city.latitude,
        longitude: city.longitude,
        googleMapsUrl: city.googleMapsUrl || null,
        cityPrice: city.cityPrice || null,
        placePrice: null,
        name: t.name || null,
        cityName: t.country || null,
        audioUrl: t.audioUrl || null,
        infoCity: t.infoCity || null,
        description: t.description || null,
        buttonText: t.buttonText || null,
        color: 'blue'
      };
    });

    res.json(response);
  } catch (error) {
    console.error('❌ Error al obtener ciudades por IDs:', error);
    res.status(500).json({ message: 'Error al obtener ciudades' });
  }
};

exports.getCitiesNear = async (req, res) => {
  const { lang, latitude, longitude } = req.query;
  const RADIUS_KM = 60;

  if (!lang || !latitude || !longitude) {
    return res.status(400).json({ message: 'Faltan parámetros' });
  }

  let userId = null;

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
    const nearbyCities = await prisma.$queryRawUnsafe(`
      SELECT *
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

    if (nearbyCities.length === 0) {
      return res.json([]);
    }

    const cityIds = nearbyCities.map(c => c.id);

    const citiesWithTranslations = await prisma.city.findMany({
      where: {
        id: { in: cityIds },
        activated: true,
        translations: {
          some: { language: lang }
        }
      },
      include: {
        translations: {
          where: { language: lang },
          select: {
            name: true,
            country: true,
            description: true,
            buttonText: true
          }
        }
      }
    });

    const response = citiesWithTranslations.map(city => {
      const t = city.translations[0] || {};

      return {
        id: city.id,
        cityId: city.id,
        name: t.name || null,
        cityName: t.country || null,
        description: t.description || null,
        buttonText: t.buttonText || null,
        cityPrice: city.cityPrice || null,
        imageUrl: city.imageUrl || null,
        latitude: city.latitude || null,
        longitude: city.longitude || null,
        googleMapsUrl: city.googleMapsUrl || null,
        views: city.views || 0,
        color: 'blue'
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error al obtener ciudades cercanas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};