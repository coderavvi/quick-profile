import mongoose, { Schema, model, models } from 'mongoose';
import bcryptjs from 'bcryptjs';

interface IAdmin {
  _id?: string;
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
adminSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

export default models.Admin || model<IAdmin>('Admin', adminSchema);
