const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const paymentController = require('../controllers/paymentController');
const withdrawalController = require('../controllers/withdrawalController');

const auth = authenticateToken;
const adminOnly = [auth, checkRole(['admin'])];
const authenticated = [auth, checkRole(['student', 'instructor', 'admin'])];

// Student / owner
router.get('/my-orders',              ...authenticated, paymentController.getMyOrders);
router.get('/orders/:id',             ...authenticated, paymentController.getOrderById);
router.post('/orders/:id/report',     ...authenticated, paymentController.studentReportPayment);

// Admin — orders
router.get('/admin/orders',                     ...adminOnly, paymentController.adminGetAllOrders);
router.put('/admin/orders/:id/confirm',         ...adminOnly, paymentController.adminConfirmPayment);
router.put('/admin/orders/:id/cancel',          ...adminOnly, paymentController.adminCancelOrder);

// Admin — instructor withdrawals
router.get('/admin/withdrawals',                    ...adminOnly, withdrawalController.adminGetWithdrawals);
router.put('/admin/withdrawals/:id/approve',        ...adminOnly, withdrawalController.adminApproveWithdrawal);
router.put('/admin/withdrawals/:id/reject',         ...adminOnly, withdrawalController.adminRejectWithdrawal);

// Admin — platform balance & own withdrawal
router.get('/admin/balance',    ...adminOnly, paymentController.adminGetBalance);
router.post('/admin/withdraw',  ...adminOnly, paymentController.adminCreateWithdrawal);

module.exports = router;
