export interface Hotel {
  id: string;
  business_id: string;
  destination_id: string;
  name: string;
  description: string;
  price_per_night: number;
  amenities?: string[];
  rating?: number;
  image_url?: string;
  availability: number;
  latitude?: number;
  longitude?: number;
  distance_km?: number;
  created_at: string;
  updated_at: string;
}

export interface HotelsResponse {
  data: Hotel[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetHotelsParams {
  page?: number;
  limit?: number;
  search?: string;
  destinationId?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}
