import React from 'react';

export default function NewsSkeleton() {
  return (
    <div className="space-y-8 animate-pulse w-full max-w-[1400px] mx-auto px-2.5 sm:px-4 py-4">
      {/* Loading Banner Indicator */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-500/10 via-amber-500/10 to-transparent dark:from-blue-500/5 dark:via-amber-500/5 p-3 rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping" />
          <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
            அமேஸ் டைம்ஸ் நேரலைச் செய்திகள் விரைவாக ஏற்றப்படுகின்றன...
          </span>
        </div>
        <div className="hidden sm:block h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-full" />
      </div>

      {/* Hero Spotlight 3-Column Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Col 1 (5 cols): Lead Hero Article */}
        <div className="lg:col-span-5 bg-white dark:bg-[#0f1b3d] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          {/* Main Image */}
          <div className="w-full h-56 sm:h-72 bg-slate-200 dark:bg-slate-700/60 rounded-2xl" />
          {/* Badge & Meta */}
          <div className="flex items-center gap-3">
            <div className="h-5 w-20 bg-red-500/20 rounded-md" />
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700/60 rounded-md" />
          </div>
          {/* Title */}
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 dark:bg-slate-700/60 rounded-lg w-full" />
            <div className="h-6 bg-slate-200 dark:bg-slate-700/60 rounded-lg w-4/5" />
          </div>
          {/* Description */}
          <div className="space-y-2 pt-1">
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700/40 rounded w-full" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700/40 rounded w-11/12" />
            <div className="h-3.5 bg-slate-200 dark:bg-slate-700/40 rounded w-3/4" />
          </div>
        </div>

        {/* Col 2 (4 cols): Top Reads / Radar List */}
        <div className="lg:col-span-4 bg-white dark:bg-[#0f1b3d] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="h-4 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 last:pb-0">
              <div className="w-20 h-16 bg-slate-200 dark:bg-slate-700/60 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-full" />
                <div className="h-3.5 bg-slate-200 dark:bg-slate-700/60 rounded w-2/3" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700/40 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>

        {/* Col 3 (3 cols): E-Paper / Publication Showcase */}
        <div className="lg:col-span-3 bg-white dark:bg-[#0f1b3d] rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
          <div className="w-full h-64 bg-slate-200 dark:bg-slate-700/60 rounded-2xl" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700/60 rounded-xl" />
        </div>
      </div>

      {/* Secondary Cards Grid Skeleton (4 Columns) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
          <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white dark:bg-[#0f1b3d] rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-full h-40 bg-slate-200 dark:bg-slate-700/60 rounded-xl" />
              <div className="h-4 w-16 bg-blue-500/20 rounded" />
              <div className="space-y-1.5">
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-full" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700/60 rounded w-4/5" />
              </div>
              <div className="flex justify-between items-center pt-2">
                <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700/40 rounded" />
                <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700/40 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
