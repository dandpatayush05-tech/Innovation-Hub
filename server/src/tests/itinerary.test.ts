import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app';
import { env } from '../config/env';

// Mock the LLM service to avoid hitting the real OpenAI API in tests
jest.mock('../services/llm', () => ({
  generateItineraryWithLLM: jest.fn().mockResolvedValue({
    destination: "Mock City",
    estimatedBudget: "$1000",
    aiRecommendations: ["Visit mock place"],
    days: [
      {
        day: 1,
        title: "Arrival",
        activities: [
          { time: "10:00 AM", title: "Activity", description: "Mock desc" }
        ]
      }
    ]
  })
}));

describe('Itinerary Endpoints', () => {
  beforeAll(async () => {
    await mongoose.connect(env.MONGODB_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should generate an itinerary successfully', async () => {
    const res = await request(app)
      .post('/api/itineraries/generate')
      .send({ prompt: 'I want to go to Tokyo for 3 days and eat sushi.' });

    expect(res.status).toBe(201);
    expect(res.body.itinerary).toHaveProperty('destination', 'Mock City');
    expect(res.body.itinerary).toHaveProperty('days');
  });

  it('should reject a prompt that is too short', async () => {
    const res = await request(app)
      .post('/api/itineraries/generate')
      .send({ prompt: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('Validation Error');
  });
});
