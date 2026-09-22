import React from 'react';

export const ExperienceCardSkeleton: React.FC = () => {
  return (
    <div className="glass-card rounded-3xl overflow-hidden p-4 animate-pulse space-y-4">
      <div className="h-56 bg-black/5 rounded-2xl w-full" />
      <div className="space-y-2 px-2">
        <div className="h-5 bg-black/5 rounded w-3/4" />
        <div className="h-3.5 bg-black/5 rounded w-full" />
        <div className="h-3.5 bg-black/5 rounded w-2/3" />
      </div>
      <div className="h-4 bg-black/5 rounded-md w-1/2 mx-2" />
      <div className="flex gap-2 pt-2 px-2">
        <div className="h-10 bg-black/5 rounded-xl flex-1" />
        <div className="h-10 bg-black/10 rounded-xl w-28" />
      </div>
    </div>
  );
};
