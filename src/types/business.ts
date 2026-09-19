export interface Business {
  id: string;
  user_id: string;
  business_name: string;
  business_type: 'hotel' | 'agency' | 'guide';
  description?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  contact_email: string;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface BusinessesResponse {
  data: Business[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetBusinessesParams {
  page?: number;
  limit?: number;
  search?: string;
  business_type?: 'hotel' | 'agency' | 'guide';
  location?: string;
  verified?: boolean;
  user_id?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
