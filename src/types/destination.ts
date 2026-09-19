export interface IntelligenceData {
  where_to_go?: string[];
  how_to_reach?: {
    flight?: string;
    train?: string;
    bus?: string;
    auto?: string;
  };
  best_time_to_visit?: {
    months?: string;
    notes?: string;
  };
  what_to_do?: string[];
  budget?: {
    hotel?: number;
    food?: number;
    activities?: number;
  };
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  image_url: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  intelligence_data?: IntelligenceData;
  created_at: string;
  updated_at: string;
}

export interface DestinationsResponse {
  data: Destination[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetDestinationsParams {
  page?: number;
  limit?: number;
  search?: string;
  country?: string;
  tag?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}
