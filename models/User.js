import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true, //  Make sure to hash this before saving
  },
  googleBusinessProfile: { // Added as per PDF
    type: String,
  },
  orders: [{ //connecting the User and Order Schemas
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
  }],
}, {
  timestamps: true,
});
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    console.log(error)
    // Pass any errors to the next middleware
    return next(error);
  }
});
userSchema.methods.isCorrectPassword = async function (password) {

    return await bcrypt.compare(password, this.password)
}
userSchema.methods.encryptPassword = async function (user, password) {
    user.password = await bcrypt.hash(password, 10)
    await user.save()
     console.log(user.password)

}

const User = mongoose.model('User', userSchema);

export default User;
