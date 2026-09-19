export interface UnifiedBooking {
  id: string;
  user_id: string;
  type: 'hotel' | 'experience' | 'flight' | 'bus' | 'auto';
  status: 'pending' | 'confirmed' | 'cancelled' | 'requested' | 'in_progress' | 'completed';
  date: string;
  title: string;
  subtitle: string;
  amount: number | null;
  created_at: string;
}

// Legacy/Module-specific Booking Types
export interface Booking {
  id: string;
  hotel_id: string;
  user_id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  rooms: number;
  total_price: number;
  status: string;
  hotel?: { name: string; image_url: string; };
  occasion?: string;
}

export interface GuideBooking {
  id: string;
  tour_id: string;
  user_id: string;
  booking_date: string;
  participants: number;
  total_price: number;
  status: string;
  tour?: { name: string; };
  occasion?: string;
}
