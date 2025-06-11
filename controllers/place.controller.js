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
        placePrice: true,
        accessLevel: true,
        translations: {
          where: { language: lang },
          select: {
            name: true,
            cityName: true,
            description: true,
            audioUrl: true,
            reading: true,
            vrUrl: true,
            videoUrl: true
          }
        },
        city: {
          select: {
            cityPrice: true,
            translations: {
              where: { language: lang },
              select: {
                name: true
              }
            }
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

      const color = hasAccess ? 'blue' : place.accessLevel === 'REGISTERED' ? 'yellow' : ['SUBSCRIPTION', 'PAID'].includes(place.accessLevel) ? 'red' : 'blue';


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
        cityId: place.cityId,
        imageUrl: place.imageUrl,
        locationUrl: place.locationUrl,
        views: place.views,
        placePrice: place.placePrice,
        cityPrice: place.city?.cityPrice || null,
        cityName: place.city?.translations?.[0]?.name || null,
        name: translation?.name || null,
        cityName: translation?.cityName || null,
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
  let userId = null;
  let isSubscribed = false;

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

  try {
    const cities = await prisma.city.findMany({ select: { id: true } });

    let purchases = [];
    if (userId) {
      purchases = await prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          OR: [
            { type: 'SUBSCRIPTION', expiresAt: { gt: new Date() } },
            { type: 'CITY', cities: { some: {} } },
            { type: 'BUNDLE', cities: { some: {} } },
            { type: 'PLACE', places: { some: {} } }
          ]
        },
        include: {
          cities: true,
          places: true
        }
      });

      isSubscribed = purchases.some(p => p.type === 'SUBSCRIPTION' && p.expiresAt > new Date());
    }

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
            cityId: true,
            imageUrl: true,
            locationUrl: true,
            views: true,
            accessLevel: true,
            translations: {
              where: { language: lang },
              select: {
                name: true,
                cityName: true,
                description: true,
                audioUrl: true,
                reading: true,
                vrUrl: true,
                videoUrl: true
              }
            }
          }
        });

        if (!place || place.translations.length === 0) return null;

        const translation = place.translations[0];

        let hasAccess = false;
        let cityAccess = false;

        if (userId) {
          cityAccess = purchases.some(p =>
            ['CITY', 'BUNDLE'].includes(p.type) &&
            p.cities.some(c => c.cityId === city.id)
          );
        }

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

        const color =
          place.accessLevel === 'REGISTERED' ? 'yellow' : ['SUBSCRIPTION', 'PAID'].includes(place.accessLevel) ? 'red' : 'blue';

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
          cityId: place.cityId,
          imageUrl: place.imageUrl,
          locationUrl: place.locationUrl,
          views: place.views,
          name: translation.name,
          cityName: translation.cityName,
          description: translation.description,
          audioUrl: hasAccess ? translation.audioUrl : restrictedValue(),
          reading: hasAccess ? translation.reading : restrictedValue(),
          vrUrl: hasAccess ? translation.vrUrl : restrictedValue(),
          videoUrl: hasAccess ? translation.videoUrl : restrictedValue(),
          color
        };
      })
    );

    res.json(results.filter(r => r !== null));
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

  let userId = null;
  let isSubscribed = false;

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
            reading: true,
            vrUrl: true,
            videoUrl: true
          }
        }
      }
    });

    let purchases = [];
    let cityAccessByCityId = {};

    if (userId) {
      purchases = await prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          OR: [
            { type: 'SUBSCRIPTION', expiresAt: { gt: new Date() } },
            { type: 'CITY', cities: { some: {} } },
            { type: 'BUNDLE', cities: { some: {} } },
            { type: 'PLACE', places: { some: {} } }
          ]
        },
        include: {
          cities: true,
          places: true
        }
      });

      isSubscribed = purchases.some(p => p.type === 'SUBSCRIPTION' && p.expiresAt > new Date());

      purchases.forEach(p => {
        if (['CITY', 'BUNDLE'].includes(p.type)) {
          p.cities.forEach(c => {
            cityAccessByCityId[c.cityId] = true;
          });
        }
      });
    }

    const restrictedValue = (accessLevel) => {
      switch (accessLevel) {
        case 'REGISTERED':
          return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_registro_gk13yd.mp4';
        case 'SUBSCRIPTION':
        case 'PAID':
          return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_pago_wocym7.mp4';
        default:
          return null;
      }
    };

    const response = places.map(place => {
      const t = place.translations[0] || {};
      const cityTranslation = place.city?.translations?.[0]?.name || null;

      let hasAccess = false;
      const cityId = place.cityId;

      if (place.accessLevel === 'FREE') {
        hasAccess = true;
      } else if (place.accessLevel === 'REGISTERED') {
        hasAccess = !!userId;
      } else if (place.accessLevel === 'SUBSCRIPTION') {
        hasAccess = isSubscribed;
      } else if (place.accessLevel === 'PAID') {
        const hasPlace = purchases.some(p =>
          p.type === 'PLACE' && p.places.some(pp => pp.placeId === place.id)
        );
        const cityAccess = cityAccessByCityId[cityId];
        hasAccess = isSubscribed || cityAccess || hasPlace;
      }

      const color = place.accessLevel === 'REGISTERED' ? 'yellow' : ['SUBSCRIPTION', 'PAID'].includes(place.accessLevel) ? 'red' : 'blue';

      return {
        id: place.id,
        cityId: cityId,
        city: {
          id: cityId,
          name: cityTranslation
        },
        cityPrice: place.cityPrice,
        imageUrl: place.imageUrl,
        locationUrl: place.locationUrl,
        views: place.views,
        name: t.name || null,
        cityName: t.cityName ||null,
        description: t.description || null,
        audioUrl: hasAccess ? t.audioUrl || null : restrictedValue(place.accessLevel),
        reading: hasAccess ? t.reading || null : restrictedValue(place.accessLevel),
        vrUrl: hasAccess ? t.vrUrl || null : restrictedValue(place.accessLevel),
        videoUrl: hasAccess ? t.videoUrl || null : restrictedValue(place.accessLevel),
        color
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error al obtener lugares por IDs:', error);
    res.status(500).json({ message: 'Error al obtener lugares' });
  }
};

exports.getPlaceNear = async (req, res) => {
  const { lang, latitude, longitude } = req.query;
  const RADIUS_KM = 60;

  if (!lang || !latitude || !longitude) {
    return res.status(400).json({ message: 'Faltan parámetros' });
  }

  let userId = null;
  let isSubscribed = false;

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

    // 🔥 Buscar los lugares de esas ciudades con traducciones
    const places = await prisma.place.findMany({
      where: {
        cityId: { in: nearbyCityIds },
        translations: { some: { language: lang } }
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
            reading: true,
            vrUrl: true,
            videoUrl: true
          }
        }
      }
    });

    let purchases = [];
    let cityAccessByCityId = {};

    if (userId) {
      purchases = await prisma.purchase.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          OR: [
            { type: 'SUBSCRIPTION', expiresAt: { gt: new Date() } },
            { type: 'CITY', cities: { some: {} } },
            { type: 'BUNDLE', cities: { some: {} } },
            { type: 'PLACE', places: { some: {} } }
          ]
        },
        include: {
          cities: true,
          places: true
        }
      });

      isSubscribed = purchases.some(p => p.type === 'SUBSCRIPTION' && p.expiresAt > new Date());

      purchases.forEach(p => {
        if (['CITY', 'BUNDLE'].includes(p.type)) {
          p.cities.forEach(c => {
            cityAccessByCityId[c.cityId] = true;
          });
        }
      });
    }

    const restrictedValue = (accessLevel) => {
      switch (accessLevel) {
        case 'REGISTERED':
          return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_registro_gk13yd.mp4';
        case 'SUBSCRIPTION':
        case 'PAID':
          return 'https://res.cloudinary.com/duw2w8izn/video/upload/v1747238085/con_pago_wocym7.mp4';
        default:
          return null;
      }
    };

    const response = places.map(place => {
      const t = place.translations[0] || {};
      const cityTranslation = place.city?.translations?.[0]?.name || null;

      let hasAccess = false;
      const cityId = place.cityId;

      if (place.accessLevel === 'FREE') {
        hasAccess = true;
      } else if (place.accessLevel === 'REGISTERED') {
        hasAccess = !!userId;
      } else if (place.accessLevel === 'SUBSCRIPTION') {
        hasAccess = isSubscribed;
      } else if (place.accessLevel === 'PAID') {
        const hasPlace = purchases.some(p =>
          p.type === 'PLACE' && p.places.some(pp => pp.placeId === place.id)
        );
        const cityAccess = cityAccessByCityId[cityId];
        hasAccess = isSubscribed || cityAccess || hasPlace;
      }

      const color = place.accessLevel === 'REGISTERED' ? 'yellow' : ['SUBSCRIPTION', 'PAID'].includes(place.accessLevel) ? 'red' : 'blue';

      return {
        id: place.id,
        cityId,
        city: {
          id: cityId,
          name: cityTranslation
        },
        cityPrice: place.cityPrice,
        imageUrl: place.imageUrl,
        locationUrl: place.locationUrl,
        views: place.views,
        name: t.name || null,
        cityName: t.cityName || null,
        description: t.description || null,
        audioUrl: hasAccess ? t.audioUrl || null : restrictedValue(place.accessLevel),
        reading: hasAccess ? t.reading || null : restrictedValue(place.accessLevel),
        vrUrl: hasAccess ? t.vrUrl || null : restrictedValue(place.accessLevel),
        videoUrl: hasAccess ? t.videoUrl || null : restrictedValue(place.accessLevel),
        color
      };
    });

    res.json(response);
  } catch (error) {
    console.error('Error al obtener lugares cercanos:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};





