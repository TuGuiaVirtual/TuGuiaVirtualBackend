const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTopVisitedExperiences = async (req, res) => {
  const lang = req.query.lang;
  const number = parseInt(req.query.number);
  const color = 'blue';
  
  if (!lang || isNaN(number)) {
    return res.status(400).json({ message: 'Faltan el parámetros' });
  }

  try {
    const topCities = await prisma.city.findMany({
      orderBy: { views: 'desc' },
      take: number,
      select: { id: true }
    });

    const experiencePromises = topCities.map(city =>
      prisma.experience.findFirst({
        where: { cityId: city.id },
        orderBy: { views: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          link: true,
          latitude: true,
          longitude: true,
          googleMapsUrl: true,
          price: true,
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

    let experiences = await Promise.all(experiencePromises);

    experiences = experiences.filter(exp => !!exp);

    const result = experiences.map(exp => ({
      id: exp.id,
      imageUrl: exp.imageUrl,
      link: exp.link,
      latitude: exp.latitude,
      longitude: exp.longitude,
      googleMapsUrl: exp.googleMapsUrl,
      price: exp.price || null,
      cityId: exp.city?.id || null,
      cityName: exp.city?.translations[0]?.name || null,
      name: exp.translations[0]?.name || null,
      description: exp.translations[0]?.description || null,
      firstInfo: exp.translations[0]?.firstInfo || null,
      secondInfo: exp.translations[0]?.secondInfo || null,
      thirdInfo: exp.translations[0]?.thirdInfo || null,
      info: exp.translations[0]?.info || null,
      audioUrl: exp.translations[0]?.audioUrl || null,
      color
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener experiencias populares:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getExperiences = async (req, res) => {
  const cityId = parseInt(req.query.cityId);
  const lang = req.query.lang;
  const color = 'blue';
  let experiences;

  if (!lang) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos: cityId o lang' });
  }

  try {

    if (cityId) {
      experiences = await prisma.experience.findMany({
        where: { cityId },
        orderBy: { views: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          link: true,
          latitude: true,
          longitude: true,
          googleMapsUrl: true,
          price: true,
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
    } else {
      experiences = await prisma.experience.findMany({
        orderBy: { views: 'desc' },
        select: {
          id: true,
          imageUrl: true,
          link: true,
          latitude: true,
          longitude: true,
          googleMapsUrl: true,
          price: true,
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
    }

    const result = experiences.map(r => ({
      id: r.id,
      imageUrl: r.imageUrl,
      link: r.link,
      latitude: r.latitude,
      longitude: r.longitude,
      googleMapsUrl: r.googleMapsUrl,
      price: r.price || null,
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

exports.getTopExperiencesByCity = async (req, res) => {
  const { lang } = req.query;
  const color = 'blue';

  try {
    const cities = await prisma.city.findMany({
      select: { id: true }
    });

    const results = await Promise.all(
      cities.map(async city => {
        const experience = await prisma.experience.findFirst({
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
            price: true,
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
        if (experience && experience.translations.length > 0) {
          return {
            id: experience.id,
            cityId: experience.cityId,
            imageUrl: experience.imageUrl,
            link: experience.link,
            locationUrl: experience.googleMapsUrl,
            views: experience.views,
            name: experience.translations[0].name,
            cityName: experience.translations[0].cityName,
            description: experience.translations[0].description,
            audioUrl: experience.translations[0].audioUrl,
            secondInfo: experience.translations[0].secondInfo,
            thirdInfo: experience.translations[0].thirdInfo,
            firstInfo: experience.translations[0].firstInfo,
            price: experience.price,
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

exports.getExperiencesByIds = async (req, res) => {
  const { experiencesIds, lang } = req.body;
  const color = 'blue';

  if (!Array.isArray(experiencesIds) || experiencesIds.length === 0) {
    return res.status(400).json({ message: 'La lista de IDs es inválida o está vacía' });
  }

  try {
    const experiences = await prisma.experience.findMany({
      where: {
        id: { in: experiencesIds },
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

    const response = experiences.map(exp => {
      const t = exp.translations[0] || {};
      const cityName = exp.city.translations[0]?.name || null;

      return {
        id: exp.id,
        cityId: exp.cityId,
        city: {
          id: exp.city.id,
          name: cityName
        },
        imageUrl: exp.imageUrl,
        googleMapsUrl: exp.googleMapsUrl || null,
        price: exp.price || null,
        views: exp.views,
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
    console.error('❌ Error al obtener experiencias por IDs:', error);
    res.status(500).json({ message: 'Error al obtener experiencias' });
  }
};

exports.getExperiencesNear = async (req, res) => {
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
      return res.json([]);
    }

    const experiences = await prisma.experience.findMany({
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

    const response = experiences.map(experience => {
      const t = experience.translations[0] || {};
      const cityTranslation = experience.city?.translations?.[0]?.name || null;

      return {
        id: experience.id,
        cityId: experience.cityId,
        city: {
          id: experience.cityId,
          name: cityTranslation
        },
        cityPrice: experience.city.cityPrice,
        imageUrl: experience.imageUrl,
        link: experience.link,
        views: experience.views,
        price: experience.price,
        name: t.name || null,
        cityName: t.cityName || null,
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
    console.error('Error al obtener experiencias cercanas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

