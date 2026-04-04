const User = require('../models/User');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
const getCustomers = async (req, res) => {
  const customers = await User.find({ role: 'customer' }).select('-passwordHash');
  res.json(customers);
};

// @desc    Update customer account status (e.g. disable)
// @route   PUT /api/customers/:id/status
// @access  Private/Admin
const updateCustomerStatus = async (req, res) => {
  const customer = await User.findById(req.params.id);

  if (customer && customer.role === 'customer') {
    customer.accountStatus = req.body.status || 'active';
    const updated = await customer.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

module.exports = {
  getCustomers,
  updateCustomerStatus
};
