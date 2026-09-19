import React from 'react';

export const DestinationCardSkeleton = () => {
  return (
    <div className="flex flex-col bg-white rounded-[32px] overflow-hidden border border-black/5 animate-pulse">
      <div className="relative h-[300px] w-full bg-gray-200">
        <div className="absolute bottom-6 left-6 right-6">
          <div className="w-20 h-6 bg-white/30 rounded-full mb-3" />
          <div className="w-48 h-8 bg-white/30 rounded-md" />
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-6">
          <div className="w-full h-4 bg-gray-200 rounded" />
          <div className="w-5/6 h-4 bg-gray-200 rounded" />
          <div className="w-2/3 h-4 bg-gray-200 rounded" />
        </div>
        <div className="w-24 h-5 bg-gray-200 rounded" />
      </div>
    </div>
  );
};
