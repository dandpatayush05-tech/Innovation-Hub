import mongoose, { Document, Schema } from 'mongoose';

export interface IHotel extends Document {
  businessId: mongoose.Types.ObjectId;
  destinationId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  pricePerNight: number;
  amenities: string[];
  imageUrl: string;
  rating: number;
}

const hotelSchema = new Schema<IHotel>({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  pricePerNight: { type: Number, required: true },
  amenities: [{ type: String }],
  imageUrl: { type: String, required: true },
  rating: { type: Number, min: 0, max: 5, default: 0 }
});

export default mongoose.model<IHotel>('Hotel', hotelSchema);
