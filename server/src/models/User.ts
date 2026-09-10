import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'traveler' | 'business' | 'admin';
  refreshTokenHash?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['traveler', 'business', 'admin'], default: 'traveler' },
    refreshTokenHash: { type: String, default: null }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
