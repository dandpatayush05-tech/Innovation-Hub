import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  isFallback?: boolean;
  pagination?: PaginationMeta;
}

/**
 * Unified Success Envelope Helper
 */
export const apiSuccess = <T>(
  res: Response,
  data: T,
  message?: string,
  statusCode: number = 200,
  pagination?: PaginationMeta
) => {
  return res.status(statusCode).json({
    success: true,
    data: data !== undefined ? data : null,
    ...(message && { message }),
    ...(pagination && { pagination })
  });
};

/**
 * Unified Fallback Read Helper (used during database disconnects or initial seeds)
 */
export const apiFallback = <T>(
  res: Response,
  fallbackData: T,
  message: string = 'Serving cached/seed travel catalog data',
  statusCode: number = 200,
  pagination?: PaginationMeta
) => {
  return res.status(statusCode).json({
    success: true,
    data: fallbackData || [],
    isFallback: true,
    message,
    ...(pagination && { pagination })
  });
};

/**
 * Unified Error Envelope Helper
 */
export const apiError = (
  res: Response,
  statusCode: number = 500,
  code: string = 'INTERNAL_ERROR',
  message: string = 'An unexpected error occurred',
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
      ...(details !== undefined && { details })
    }
  });
};

/**
 * Backward-compatible helper for list responses
 */
export const sendList = <T>(
  res: Response,
  data: T[],
  pagination?: PaginationMeta,
  statusCode: number = 200,
  isFallback?: boolean
) => {
  return res.status(statusCode).json({
    success: true,
    data: data || [],
    ...(isFallback && { isFallback: true }),
    ...(pagination && { pagination })
  });
};

/**
 * Backward-compatible helper for single resource responses
 */
export const sendSingle = <T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  isFallback?: boolean
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(isFallback && { isFallback: true })
  });
};

/**
 * Backward-compatible helper for mutations / action messages
 */
export const sendMessage = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: statusCode >= 200 && statusCode < 300,
    message,
    ...(data !== undefined && { data })
  });
};

/**
 * Backward-compatible helper for errors
 */
export const sendError = (
  res: Response,
  message: string,
  code: string = 'INTERNAL_ERROR',
  statusCode: number = 500,
  details?: unknown
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      message,
      code,
      ...(details !== undefined && { details })
    }
  });
};

