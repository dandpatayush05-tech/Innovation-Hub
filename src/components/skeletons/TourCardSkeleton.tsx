import React from 'react';

export const TourCardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-black/5 flex flex-col animate-pulse">
      <div className="h-48 w-full bg-gray-200 relative">
        <div className="absolute top-4 left-4 w-16 h-6 bg-white/50 rounded-full" />
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-2">
          <div className="w-2/3 h-6 bg-gray-200 rounded" />
          <div className="w-12 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-16 h-4 bg-gray-200 rounded mb-4" />
        <div className="space-y-2 mb-6">
          <div className="w-full h-3 bg-gray-200 rounded" />
          <div className="w-3/4 h-3 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
          <div className="w-12 h-6 bg-gray-200 rounded" />
          <div className="w-20 h-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
};
