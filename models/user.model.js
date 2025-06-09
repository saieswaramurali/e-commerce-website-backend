import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User Name is required'],
    trim: true,
    minLength: 2,
    maxLength: 50,
  },

  email: {
    type: String,
    required: [true, 'User Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please fill a valid email address'],
  },

  password: {
    type: String,
    minLength: 6,
    required: function() {
      return this.authProvider === 'local';
    },
    select: false,
  },

  authProvider: {
    type: String,
    enum: ['local', 'google'],
    required: true,
    default: 'local',
  },

  phone: {
    type: String,
    required: false,
  },

  address: {
    fullName: String,
    address: String,
    city: String,
    postalCode: String,
    country: String,
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  isVerified: {
    type: Boolean,
    default: false,
  },

  cart: {
  type: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
        min: 1,
      },
      addedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
  default: [], 
},


}, { timestamps: true });

userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.password;
    return ret;
  },
});

const User = mongoose.model('User', userSchema);

export default User;
