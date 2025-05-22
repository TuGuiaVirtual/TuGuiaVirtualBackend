const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const verifyToken = require('../middleware/auth')

router.post('/create-order', verifyToken, paymentController.createOrder);
router.post('/confirm-payment', verifyToken, paymentController.confirmPayment);

module.exports = router;
