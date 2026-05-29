import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {/* Table Header Skeleton */}
      <div className="hidden md:grid grid-cols-6 gap-4 border-b border-slate-100 pb-4 px-4">
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/4"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
        <div className="h-4 bg-slate-200 rounded-md w-1/4 justify-self-end"></div>
      </div>

      {/* Table Rows Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((item) => (
          <div
            key={item}
            className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center bg-white border border-slate-100 rounded-2xl p-4 md:px-4 md:py-5 shadow-sm"
          >
            {/* Name */}
            <div className="flex items-center space-x-3 col-span-1">
              <div className="w-10 h-10 bg-slate-200 rounded-xl shrink-0"></div>
              <div className="space-y-2 w-full">
                <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded-md w-1/2 md:hidden"></div>
              </div>
            </div>

            {/* Type */}
            <div className="hidden md:block">
              <div className="h-4 bg-slate-200 rounded-md w-1/2"></div>
            </div>

            {/* Size */}
            <div className="hidden md:block">
              <div className="h-4 bg-slate-200 rounded-md w-1/3"></div>
            </div>

            {/* Date */}
            <div className="hidden md:block">
              <div className="h-4 bg-slate-200 rounded-md w-2/3"></div>
            </div>

            {/* Status */}
            <div className="hidden md:block">
              <div className="h-6 bg-slate-200 rounded-full w-20"></div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 md:justify-self-end mt-2 md:mt-0">
              <div className="h-9 w-9 bg-slate-200 rounded-xl"></div>
              <div className="h-9 w-9 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
