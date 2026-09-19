import { Request, Response } from 'express';
import { executeTransportSearch } from '../services/transportSearchService';
import { ApiError } from '../utils/ApiError';

export const searchTransport = async (req: Request, res: Response) => {
  try {
    const { from, to, date, passengers, sortBy } = req.body;
    
    const result = await executeTransportSearch(
      from,
      to,
      date,
      passengers,
      sortBy
    );
    
    res.json(result);
  } catch (error: any) {
    console.error('Transport Search Error:', error);
    throw new ApiError(500, 'Failed to execute transport search', 'INTERNAL_ERROR', error.message);
  }
};
