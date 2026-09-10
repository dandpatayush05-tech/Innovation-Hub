import mongoose, { Document, Schema } from 'mongoose';

export interface IContactRequest extends Document {
  name: string;
  email: string;
  organizationType: 'traveler' | 'hotel' | 'agency' | 'guide';
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const contactRequestSchema = new Schema<IContactRequest>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    organizationType: { type: String, enum: ['traveler', 'hotel', 'agency', 'guide'], required: true },
    message: { type: String, required: true }
  },
  { timestamps: true }
);

export default mongoose.model<IContactRequest>('ContactRequest', contactRequestSchema);
