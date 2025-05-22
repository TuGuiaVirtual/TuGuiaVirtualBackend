// controllers/payments.controller.js
const paypal = require('@paypal/checkout-server-sdk');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID,
  process.env.PAYPAL_CLIENT_SECRET
);
const client = new paypal.core.PayPalHttpClient(environment);

exports.createOrder = async (req, res) => {
  const { type, id } = req.body;
  const userId = req.user.id;

  try {
    let price = null;
    let description = '';

    if (type === 'CITY') {
      const city = await prisma.city.findUnique({ where: { id: parseInt(id) } });
      if (!city || !city.cityPrice) return res.status(404).json({ error: 'Ciudad no encontrada' });
      price = parseFloat(city.cityPrice.replace(',', '.'));
      description = `Guía completa de ${city.id}`;
    } else if (type === 'PLACE') {
      const place = await prisma.place.findUnique({ where: { id: parseInt(id) } });
      if (!place || !place.placePrice) return res.status(404).json({ error: 'Lugar no encontrado' });
      price = parseFloat(place.placePrice.replace(',', '.'));
      description = `Acceso a lugar ${place.id}`;
    } else {
      return res.status(400).json({ error: 'Tipo de compra no válido' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'EUR',
          value: price.toFixed(2)
        },
        description
      }]
    });

    const order = await client.execute(request);
    res.json({ id: order.result.id });

  } catch (error) {
    console.error('Error creando orden:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

exports.confirmPayment = async (req, res) => {
  const { paypalOrderId, type, targetId } = req.body;
  const userId = req.user.id;

  try {
    const request = new paypal.orders.OrdersGetRequest(paypalOrderId);
    const orderResult = await client.execute(request);

    if (!orderResult.result || orderResult.result.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'La orden no está completada' });
    }

    const amount = parseFloat(orderResult.result.purchase_units[0].amount.value);
    const currency = orderResult.result.purchase_units[0].amount.currency_code;

    let expectedPrice = 0;

    if (type === 'CITY') {
      const city = await prisma.city.findUnique({ where: { id: parseInt(targetId) } });
      if (!city || !city.cityPrice) return res.status(404).json({ error: 'Ciudad no encontrada' });
      expectedPrice = parseFloat(city.cityPrice.replace(',', '.'));
    } else if (type === 'PLACE') {
      const place = await prisma.place.findUnique({ where: { id: parseInt(targetId) } });
      if (!place || !place.placePrice) return res.status(404).json({ error: 'Lugar no encontrado' });
      expectedPrice = parseFloat(place.placePrice.replace(',', '.'));
    } else {
      return res.status(400).json({ error: 'Tipo de compra no válido' });
    }

    if (Math.abs(expectedPrice - amount) > 0.01) {
      return res.status(400).json({ error: 'El monto no coincide con la base de datos' });
    }

    const newPurchase = await prisma.purchase.create({
      data: {
        userId: parseInt(userId),
        amount,
        currency,
        status: 'COMPLETED',
        platform: 'WEB',
        paymentMethod: 'PayPal',
        externalId: paypalOrderId,
        type,
        ...(type === 'CITY' && {
          cities: { create: { cityId: parseInt(targetId) } }
        }),
        ...(type === 'PLACE' && {
          places: { create: { placeId: parseInt(targetId) } }
        })
      }
    });

    res.status(200).json({ success: true, purchaseId: newPurchase.id });

  } catch (err) {
    console.error('Error confirmando el pago:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


