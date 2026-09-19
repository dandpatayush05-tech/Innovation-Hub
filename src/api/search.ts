import api from '../lib/axios';

export interface SearchResult {
  id: string;
  type: 'destination' | 'business' | 'hotel' | 'tour';
  title: string;
  summary: string;
  image: string | null;
}

export interface SearchResponse {
  data: SearchResult[];
  count: number;
}

export const globalSearch = async (q: string, type?: string): Promise<SearchResponse> => {
  const { data } = await api.get<SearchResponse>('/search', { params: { q, type } });
  return data;
};
