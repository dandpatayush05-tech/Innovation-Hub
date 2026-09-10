import mongoose, { Document, Schema } from 'mongoose';

export interface IBusiness extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: 'hotel' | 'agency' | 'guide';
  description?: string;
  location?: string;
  contactEmail: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    businessName: { type: String, required: true },
    businessType: { type: String, enum: ['hotel', 'agency', 'guide'], required: true },
    description: { type: String },
    location: { type: String },
    contactEmail: { type: String, required: true },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export default mongoose.model<IBusiness>('Business', businessSchema);
