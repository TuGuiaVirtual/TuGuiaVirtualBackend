const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        return res.status(400).json({message: 'Faltan parámetros'})
    }

    try {
        const cities = await prisma.city.findMany({
            orderBy: {
                views: 'desc'
            },
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
                    description: true,
                    buttonText: true,
                    infoCity: true,
                    audioUrl: true
                }
                }
            }
        });

        const result = cities.map(city => ({
            id: city.id,
            imageUrl: city.imageUrl,
            link: city.link,
            latitude: city.latitude,
            longitude: city.longitude,
            googleMapsUrl: city.googleMapsUrl,
            name: city.translations[0]?.name || null,
            description: city.translations[0]?.description || null,
            buttonText: city.translations[0]?.buttonText || null,
            infoCity: city.translations[0]?.infoCity || null,
            audioUrl: city.translations[0]?.audioUrl || null,
        }));
          
      
        res.json(result);
    } catch (error) {
        console.error('Error al obtener ciudades populares:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};
