const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getPlaces = async (req, res) => {
  const cityId = parseInt(req.query.cityId);
  const lang = req.query.lang;

  if (!cityId || !lang) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos: cityId o lang' });
  }

  try {
    const places = await prisma.place.findMany({
      where: { cityId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        imageUrl: true,
        locationUrl: true,
        views: true,
        translations: {
          where: { language: lang },
          select: {
            name: true,
            description: true,
            audioUrl: true,
            reading: true,
            vrUrl: true,
            videoUrl: true
          }
        }
      }
    });

    const result = places.map(place => ({
      id: place.id,
      imageUrl: place.imageUrl,
      locationUrl: place.locationUrl,
      views: place.views,
      name: place.translations[0]?.name || null,
      description: place.translations[0]?.description || null,
      audioUrl: place.translations[0]?.audioUrl || null,
      reading: place.translations[0]?.reading || null,
      vrUrl: place.translations[0]?.vrUrl || null,
      videoUrl: place.translations[0]?.videoUrl || null
    }));

    res.json(result);
  } catch (error) {
    console.error('Error al obtener lugares turísticos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getTopPlaceByCity = async (req, res) => {
  const lang = req.query.lang;

  try {
    const cities = await prisma.city.findMany({
      select: { id: true }
    });

    const results = await Promise.all(
      cities.map(async city => {
        const place = await prisma.place.findFirst({
          where: {
            cityId: city.id,
            translations: { some: { language: lang } }
          },
          orderBy: { views: 'desc' },
          select: {
            id: true,
            imageUrl: true,
            locationUrl: true,
            views: true,
            cityId: true,
            translations: {
              where: { language: lang },
              select: {
                name: true,
                description: true,
                audioUrl: true,
                reading: true,
                vrUrl: true,
                videoUrl: true
              }
            }
          }
        });
        if (place && place.translations.length > 0) {
          return {
            id: place.id,
            cityId: place.cityId,
            imageUrl: place.imageUrl,
            locationUrl: place.locationUrl,
            views: place.views,
            name: place.translations[0].name,
            description: place.translations[0].description,
            audioUrl: place.translations[0].audioUrl,
            reading: place.translations[0].reading,
            vrUrl: place.translations[0].vrUrl,
            videoUrl: place.translations[0].videoUrl,
          };
        } else {
          return null;
        }
      })
    );

    res.json(results.filter(x => x !== null));
  } catch (error) {
    console.error('Error al obtener los lugares más visitados:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
