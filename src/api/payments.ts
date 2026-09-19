import api from '../lib/axios';

export interface Payment {
  id: string;
  user_id: string;
  booking_id: string;
  booking_type: 'hotel' | 'flight' | 'bus' | 'auto' | 'tour';
  amount: number;
  currency: string;
  provider: string;
  provider_order_id: string;
  provider_payment_id: string;
  status: 'created' | 'pending' | 'paid' | 'failed' | 'refunded';
  paid_at: string | null;
  created_at: string;
}

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  status?: string;
  booking_type?: string;
}

export interface PaymentsResponse {
  data: Payment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getPayments = async (params?: GetPaymentsParams): Promise<PaymentsResponse> => {
  const response = await api.get('/payments', { params });
  return response.data;
};

export const downloadReceipt = async (id: string, fileName?: string): Promise<void> => {
  const response = await api.get(`/payments/${id}/receipt`, {
    responseType: 'blob' // Important for file downloads
  });
  
  // Create a blob URL and trigger download
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  
  const contentDisposition = response.headers['content-disposition'];
  let downloadName = fileName || `receipt_${id.substring(0, 8)}.pdf`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
    if (filenameMatch && filenameMatch.length === 2) {
      downloadName = filenameMatch[1];
    }
  }
  
  link.setAttribute('download', downloadName);
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
