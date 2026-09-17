import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
  // If the error is a Zod validation error, return 422 Unprocessable Entity
  if (err instanceof ZodError) {
    // We map Zod issues to a cleaner format without exposing internal schema paths unnecessarily, 
    // though the default Zod format is generally safe.
    const issues = err.issues.map(issue => ({
      path: issue.path.join('.'),
      message: issue.message
    }));
    console.error('Zod Validation Failed:', JSON.stringify(issues, null, 2));
    return res.status(422).json({
      error: {
        message: 'Validation failed',
        details: issues
      }
    });
  }

  // If the error is a known ApiError, use its status and message
  if (err instanceof ApiError) {
    const responsePayload: any = { message: err.message };
    if (err.details !== undefined) {
      responsePayload.details = err.details;
    }
    
    return res.status(err.status).json({
      error: responsePayload
    });
  }

  // Handle generic / unknown errors
  console.error('[Error]', err); // Log the full error server-side for debugging

  // Return a generic 500 error to the client, explicitly omitting stack traces and DB messages
  const isPostgresError = typeof err === 'object' && err !== null && 'code' in err && 'detail' in err;
  
  if (isPostgresError) {
    return res.status(500).json({
      error: {
        message: 'Database operation failed'
      }
    });
  }

  const message = err instanceof Error ? err.message : 'Internal Server Error';

  return res.status(500).json({
    error: {
      message: env.NODE_ENV === 'production' ? 'Internal Server Error' : message
    }
  });
};
