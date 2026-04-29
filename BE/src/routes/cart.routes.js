const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { getCart, addToCart, removeFromCart, clearCart, checkout } = require('../controllers/cartController');

const auth = [authenticateToken, checkRole(['student', 'instructor', 'admin'])];

router.get('/cart', ...auth, getCart);
router.post('/cart', ...auth, addToCart);
router.post('/cart/checkout', ...auth, checkout);
router.delete('/cart/:course_id', ...auth, removeFromCart);
router.delete('/cart', ...auth, clearCart);

module.exports = router;
