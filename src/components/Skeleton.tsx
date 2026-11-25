import React from "react";
import { motion } from "framer-motion";

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <motion.div
      className={`bg-slate-200 dark:bg-slate-700 rounded ${className}`}
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
};

export const WidgetSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
};

export const ProgressRingSkeleton: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-brand/10 via-purple-500/10 to-pink-500/10 dark:from-brand/20 dark:via-purple-500/20 dark:to-pink-500/20 rounded-2xl p-6 border border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between">
        {/* Left: Ring placeholder */}
        <div className="flex items-center gap-6">
          <Skeleton className="h-[120px] w-[120px] rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-5 w-24" />
          </div>
        </div>

        {/* Right: Stats pills */}
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-24 rounded-xl" />
          <Skeleton className="h-16 w-24 rounded-xl" />
          <Skeleton className="h-16 w-24 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

export const HeroWidgetSkeleton: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      {/* Content */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-10/12" />
      </div>

      {/* Footer */}
      <div className="flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 w-24 rounded-lg" />
      </div>
    </div>
  );
};
