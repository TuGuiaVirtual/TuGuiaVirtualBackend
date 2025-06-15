const axios = require('axios');

exports.getCityFromCoordinates = async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Parámetros lat y lon requeridos' });
  }

  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat,
        lon,
        format: 'json'
      },
      headers: {
        'User-Agent': 'TuGuiaVirtual/1.0 (contacto@tuguia.app)',
        'Accept-Language': 'en'
      }
    });

    console.log('devuelve: ' ,response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error al obtener la ciudad:', error.message);
    res.status(500).json({ error: 'Error al consultar Nominatim' });
  }
};
