const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');
const { createTicket, getMyTickets, getAllTickets, updateTicketStatus } = require('../controllers/supportController');

const auth = [authenticateToken, checkRole(['student', 'instructor', 'admin'])];
const adminAuth = [authenticateToken, checkRole(['admin'])];

// POST /api/support/tickets
router.post('/support/tickets', ...auth, createTicket);

// GET /api/support/tickets
router.get('/support/tickets', ...auth, getMyTickets);

// GET /api/admin/support/tickets
router.get('/admin/support/tickets', ...adminAuth, getAllTickets);

// PUT /api/admin/support/tickets/:id
router.put('/admin/support/tickets/:id', ...adminAuth, updateTicketStatus);

module.exports = router;
