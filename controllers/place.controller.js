const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const jwt = require('jsonwebtoken');

exports.getPlaces = async (req, res) => {
  const cityId = parseInt(req.query.cityId, 10);
  const lang = req.query.lang;
  
  let userId = null;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;
    } catch (err) {
      console.warn('Token inválido, se ignora:', err.message);
    }
  }

  if (!cityId || !lang) {
    return res.status(400).json({ message: 'Faltan parámetros requeridos: cityId o lang' });
  }

  try {
    const places = await prisma.place.findMany({
      where: { cityId },
      orderBy: { id: 'asc' },
      select: {
        id: true,
        cityId: true,
        imageUrl: true,
        locationUrl: true,
        views: true,
        accessLevel: true,
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

    let purchases = [];
    let isSubscribed = false;
    let cityAccess = false;

    if (userId) {
      purchases = await prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          OR: [
            { type: 'SUBSCRIPTION', expiresAt: { gt: new Date() } },
            { type: 'CITY', cities: { some: { cityId } } },
            { type: 'BUNDLE', cities: { some: { cityId } } },
            { type: 'PLACE', places: { some: { place: { cityId } } } }
          ]
        },
        include: {
          cities: true,
          places: true
        }
      });

      isSubscribed = purchases.some(p => p.type === 'SUBSCRIPTION' && p.expiresAt > new Date());

      cityAccess = purchases.some(p =>
        ['CITY', 'BUNDLE'].includes(p.type) &&
        p.cities.some(c => c.cityId === cityId)
      );
    }

    const result = places.map(place => {
      const translation = place.translations[0];
      let hasAccess = false;

      switch (place.accessLevel) {
        case 'FREE':
          hasAccess = true;
          break;
        case 'REGISTERED':
          hasAccess = !!userId;
          break;
        case 'SUBSCRIPTION':
          hasAccess = isSubscribed;
          break;
        case 'PAID':
          const hasPlace = purchases.some(p =>
            p.type === 'PLACE' &&
            p.places.some(pp => pp.placeId === place.id)
          );
          hasAccess = isSubscribed || cityAccess || hasPlace;
          break;
      }

      const color = place.accessLevel === 'REGISTERED' ? 'yellow' : place.accessLevel === 'SUBSCRIPTION' || place.accessLevel === 'PAID' ? 'red' : 'blue';

      const restrictedValue = () => {
        switch (place.accessLevel) {
          case 'REGISTERED':
            return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_registro_gk13yd.mp4';
          case 'SUBSCRIPTION':
          case 'PAID':
            return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_pago_wocym7.mp4';
          default:
            return null;
        }
      };

      return {
        id: place.id,
        imageUrl: place.imageUrl,
        locationUrl: place.locationUrl,
        views: place.views,
        name: translation?.name || null,
        description: translation?.description || null,
        audioUrl: hasAccess ? translation?.audioUrl || null : restrictedValue(),
        reading: hasAccess ? translation?.reading || null : restrictedValue(),
        vrUrl: hasAccess ? translation?.vrUrl || null : restrictedValue(),
        videoUrl: hasAccess ? translation?.videoUrl || null : restrictedValue(),
        color
      };
    });

    return res.json(result);
  } catch (error) {
    console.error('Error al obtener lugares turísticos:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
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
    console.error('Error al obtener los lugares más visitados por ciudad:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.getPlacesByIds = async (req, res) => {
  const { placeIds, lang } = req.body;
  
  if (!Array.isArray(placeIds) || placeIds.length === 0) {
    return res.status(400).json({ message: 'La lista de IDs es inválida o está vacía' });
  }

  try {
    const places = await prisma.place.findMany({
      where: {
        id: { in: placeIds },
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
            reading: true,
            vrUrl: true,
            videoUrl: true
          }
        }
      }
    });

    const response = places.map(place => {
      const t = place.translations[0] || {};
      const cityTranslation = place.city?.translations?.[0]?.name || null;

      return {
        id: place.id,
        cityId: place.cityId,
        city: {
          id: place.city.id,
          name: cityTranslation
        },
        imageUrl: place.imageUrl,
        locationUrl: place.locationUrl,
        views: place.views,
        name: t.name || null,
        description: t.description || null,
        audioUrl: t.audioUrl || null,
        reading: t.reading || null,
        vrUrl: t.vrUrl || null,
        videoUrl: t.videoUrl || null
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error al obtener lugares por IDs:', error);
    res.status(500).json({ message: 'Error al obtener lugares' });
  }
};


