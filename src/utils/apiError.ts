import { AxiosError } from 'axios';

export interface ApiErrorResponse {
  message: string;
  code: string;
  details?: unknown;
}

export const parseApiError = (error: unknown): ApiErrorResponse => {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<{ error?: ApiErrorResponse }>;
    if (axiosError.response?.data?.error) {
      return {
        message: axiosError.response.data.error.message || 'An unexpected error occurred.',
        code: axiosError.response.data.error.code || 'UNKNOWN_ERROR',
        details: axiosError.response.data.error.details,
      };
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  return {
    message: 'An unexpected error occurred.',
    code: 'UNKNOWN_ERROR',
  };
};
