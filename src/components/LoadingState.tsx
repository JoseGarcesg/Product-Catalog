/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function LoadingState() {
  // We mock 8 products for the skeleton representation
  const skeletonCards = Array.from({ length: 8 }, (_, i) => i);

  return (
    <div id="loading-container" className="w-full">
      {/* Controls Loading Skeleton */}
      <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
        <div className="h-10 w-full md:max-w-md bg-gray-100 rounded-xl animate-pulse" />
        <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div 
              key={idx} 
              className="h-8 w-20 md:w-28 bg-gray-100 rounded-full flex-shrink-0 animate-pulse" 
            />
          ))}
        </div>
      </div>

      {/* Grid of Product Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {skeletonCards.map((id) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: id * 0.05 }}
            id={`skeleton-card-${id}`}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-xs flex flex-col h-[400px]"
          >
            {/* Image Shimmer Area */}
            <div className="relative h-48 w-full bg-gray-50 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-linear-to-r from-gray-100 via-gray-200/50 to-gray-100 animate-[pulse_1.5s_infinite]" />
            </div>

            {/* Content Area Shimmer */}
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                {/* Category badge skeleton */}
                <div className="h-4 w-1/3 bg-gray-100 rounded-md animate-pulse" />
                
                {/* Title skeletons */}
                <div className="space-y-1.5">
                  <div className="h-5 w-full bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-5 w-4/5 bg-gray-100 rounded-md animate-pulse" />
                </div>

                {/* Rating line skeleton */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-3.5 w-16 bg-gray-100 rounded-md animate-pulse" />
                  <div className="h-3.5 w-8 bg-gray-100 rounded-md animate-pulse" />
                </div>
              </div>

              {/* Bottom detail row representation */}
              <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-50">
                <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
                <div className="h-9 w-24 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
