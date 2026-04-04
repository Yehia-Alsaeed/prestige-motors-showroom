const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  passwordHash: { type: String, required: true },
  accountStatus: { type: String, enum: ['active', 'disabled'], default: 'active' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  preferredContact: { type: String, enum: ['email', 'phone', 'whatsapp'], default: 'email' }
}, { timestamps: true });

userSchema.pre('save', async function() {
  if (!this.isModified('passwordHash')) return;
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);
