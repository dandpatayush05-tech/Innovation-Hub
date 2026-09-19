export interface Tour {
  id: string;
  business_id: string;
  destination_id: string;
  name: string;
  description: string;
  price: number;
  duration_hours: number;
  category: string;
  availability: number;
  image_url: string;
  latitude?: number;
  longitude?: number;
  created_at: string;
  updated_at: string;
}

export interface ToursResponse {
  data: Tour[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetToursParams {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minAvailability?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
