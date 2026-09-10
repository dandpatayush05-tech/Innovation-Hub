import OpenAI from 'openai';
import { env } from '../config/env';

const openai = new OpenAI({
  apiKey: env.LLM_API_KEY
});

const systemPrompt = `
You are an expert travel planner. The user will provide a prompt describing their travel plans.
You MUST respond with a strictly formatted JSON object matching this exact structure:
{
  "destination": "Name of the destination city or country",
  "estimatedBudget": "E.g. $1500 - $2000",
  "aiRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
  "days": [
    {
      "day": 1,
      "title": "Day title",
      "activities": [
        {
          "time": "09:00 AM",
          "title": "Activity title",
          "description": "Detailed description of the activity"
        }
      ]
    }
  ]
}
DO NOT wrap the response in markdown blocks like \`\`\`json. DO NOT include any prose before or after the JSON. Return ONLY the raw JSON string.
`;

export const generateItineraryWithLLM = async (prompt: string, retries = 1): Promise<any> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content.trim());
  } catch (error) {
    if (retries > 0) {
      console.log('LLM generation failed, retrying...');
      return generateItineraryWithLLM(prompt, retries - 1);
    }
    throw new Error('Failed to generate valid itinerary from AI');
  }
};
