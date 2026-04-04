const express = require('express');
const router = express.Router();
const { getCustomers, updateCustomerStatus } = require('../controllers/customerController');
const { protect, adminGuard } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, adminGuard, getCustomers);

router.put('/:id/status', protect, adminGuard, updateCustomerStatus);

module.exports = router;
