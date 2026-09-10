import mongoose, { Document, Schema } from 'mongoose';

export interface IGuideBooking extends Document {
  userId: mongoose.Types.ObjectId;
  businessId: mongoose.Types.ObjectId;
  date: Date;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const guideBookingSchema = new Schema<IGuideBooking>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  date: { type: Date, required: true },
  notes: { type: String },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
});

export default mongoose.model<IGuideBooking>('GuideBooking', guideBookingSchema);
