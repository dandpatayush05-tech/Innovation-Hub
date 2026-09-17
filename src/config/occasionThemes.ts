import React from 'react';
import { Heart, Sun, Snowflake } from 'lucide-react';

export type OccasionType = 'honeymoon' | 'date' | 'vacation' | 'winter';

export interface OccasionTheme {
  id: OccasionType;
  label: string;
  icon: React.ElementType;
  colors: {
    bg: string;
    text: string;
    accent: string;
  };
  surpriseMessage: string;
}

export const OCCASION_THEMES: Record<OccasionType, OccasionTheme> = {
  honeymoon: {
    id: 'honeymoon',
    label: 'Honeymoon',
    icon: Heart,
    colors: {
      bg: 'bg-rose-50',
      text: 'text-rose-900',
      accent: 'text-rose-500',
    },
    surpriseMessage: 'Complimentary bottle of wine awaits you at check-in'
  },
  date: {
    id: 'date',
    label: 'Date Trip',
    icon: Heart,
    colors: {
      bg: 'bg-pink-50',
      text: 'text-pink-900',
      accent: 'text-pink-500',
    },
    surpriseMessage: 'Complimentary bottle of wine awaits you at check-in'
  },
  vacation: {
    id: 'vacation',
    label: 'Vacation',
    icon: Sun,
    colors: {
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      accent: 'text-amber-500',
    },
    surpriseMessage: 'Complimentary dessert & coke on us'
  },
  winter: {
    id: 'winter',
    label: 'Winter Trip',
    icon: Snowflake,
    colors: {
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      accent: 'text-blue-500',
    },
    surpriseMessage: 'Complimentary chilled beer to warm up your winter trip'
  }
};
