import React from 'react';

// Single shimmer card skeleton
const SkeletonCard: React.FC = () => (
  <div className="aspect-[4/5] lg:aspect-square rounded-[1.25rem] lg:rounded-[1.5rem] p-4 bg-text-app/5 border border-border-app overflow-hidden relative">
    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-text-app/5 to-transparent" />
    {/* Category pill */}
    <div className="w-16 h-3 rounded-full bg-text-app/8 mb-3" />
    {/* Content lines */}
    <div className="space-y-2 mt-2 flex-1">
      <div className="w-full h-3 rounded-full bg-text-app/8" />
      <div className="w-5/6 h-3 rounded-full bg-text-app/8" />
      <div className="w-4/6 h-3 rounded-full bg-text-app/8" />
      <div className="w-3/4 h-3 rounded-full bg-text-app/8 mt-4" />
      <div className="w-2/3 h-3 rounded-full bg-text-app/8" />
    </div>
    {/* Footer */}
    <div className="flex justify-between items-center mt-4">
      <div className="w-12 h-2 rounded-full bg-text-app/8" />
      <div className="w-6 h-6 rounded-xl bg-text-app/8" />
    </div>
  </div>
);

// Grid of skeleton cards
export const NoteGridSkeleton: React.FC<{ count?: number }> = ({ count = 10 }) => (
  <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

// Full page loading skeleton (mimics dashboard layout)
export const DashboardSkeleton: React.FC = () => (
  <div className="animate-in fade-in duration-300 space-y-10 pb-32">
    {/* Header skeleton */}
    <div className="space-y-3 mt-14 lg:mt-0">
      <div className="w-48 h-8 bg-text-app/8 rounded-2xl" />
      <div className="w-72 h-4 bg-text-app/5 rounded-xl" />
    </div>
    {/* Stats row */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-24 rounded-2xl bg-text-app/5 border border-border-app animate-pulse" />
      ))}
    </div>
    {/* Section label */}
    <div className="w-32 h-5 bg-text-app/8 rounded-xl" />
    {/* Note grid */}
    <NoteGridSkeleton count={8} />
  </div>
);
