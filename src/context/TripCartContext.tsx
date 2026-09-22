import React, { createContext, useContext, useState, useEffect } from 'react';

export interface TripCartItem {
  id: string;
  type: 'flight' | 'hotel' | 'bus' | 'cab' | 'experience' | 'activity';
  title: string;
  subtitle?: string;
  date?: string;
  price: number;
  quantity?: number;
  dayNumber?: number;
  details?: Record<string, any>;
  rawBookingId?: string;
}

interface TripCartContextType {
  items: TripCartItem[];
  tripId: string;
  addItem: (item: Omit<TripCartItem, 'id'>) => void;
  addItems: (items: Omit<TripCartItem, 'id'>[]) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalAmount: number;
  itemCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const TripCartContext = createContext<TripCartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'yatrasetu_trip_cart_v1';
const TRIP_ID_KEY = 'yatrasetu_active_trip_id';

export const TripCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<TripCartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [tripId, setTripId] = useState<string>(() => {
    const saved = localStorage.getItem(TRIP_ID_KEY);
    if (saved) return saved;
    const newId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    localStorage.setItem(TRIP_ID_KEY, newId);
    return newId;
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save trip cart to localStorage', e);
    }
  }, [items]);

  const addItem = (item: Omit<TripCartItem, 'id'>) => {
    const newItem: TripCartItem = {
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    };
    setItems(prev => [...prev, newItem]);
  };

  const addItems = (newItems: Omit<TripCartItem, 'id'>[]) => {
    const prepared = newItems.map(item => ({
      ...item,
      id: `cart_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    }));
    setItems(prev => [...prev, ...prepared]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => {
    setItems([]);
    const newId = `trip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setTripId(newId);
    localStorage.setItem(TRIP_ID_KEY, newId);
  };

  const totalAmount = items.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const itemCount = items.length;

  return (
    <TripCartContext.Provider
      value={{
        items,
        tripId,
        addItem,
        addItems,
        removeItem,
        clearCart,
        totalAmount,
        itemCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </TripCartContext.Provider>
  );
};

export const useTripCart = (): TripCartContextType => {
  const context = useContext(TripCartContext);
  if (!context) {
    throw new Error('useTripCart must be used within a TripCartProvider');
  }
  return context;
};
