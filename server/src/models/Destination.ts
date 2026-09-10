import mongoose, { Document, Schema } from 'mongoose';

export interface IDestination extends Document {
  name: string;
  country: string;
  description: string;
  imageUrl: string;
  tags: string[];
}

const destinationSchema = new Schema<IDestination>({
  name: { type: String, required: true },
  country: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
  tags: [{ type: String }]
});

export default mongoose.model<IDestination>('Destination', destinationSchema);
