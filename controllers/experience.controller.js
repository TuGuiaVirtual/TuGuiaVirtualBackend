const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getTopVisitedExperiences = async (req, res) => {
  const lang = req.query.lang;
  const number = parseInt(req.query.number);
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
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener restaurantes:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
