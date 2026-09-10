import mongoose, { Document, Schema } from 'mongoose';

export interface IItinerary extends Document {
  userId?: mongoose.Types.ObjectId | null;
  prompt: string;
  destination: string;
  days: {
    day: number;
    title: string;
    activities: {
      time: string;
      title: string;
      description: string;
    }[];
  }[];
  estimatedBudget: string;
  aiRecommendations: string[];
  createdAt: Date;
  updatedAt: Date;
}

const itinerarySchema = new Schema<IItinerary>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    prompt: { type: String, required: true },
    destination: { type: String, required: true },
    days: [
      {
        day: { type: Number, required: true },
        title: { type: String, required: true },
        activities: [
          {
            time: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true }
          }
        ]
      }
    ],
    estimatedBudget: { type: String, required: true },
    aiRecommendations: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model<IItinerary>('Itinerary', itinerarySchema);
