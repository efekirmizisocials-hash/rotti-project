import React from "react";
import { motion } from "framer-motion";
import { ChevronRightIcon } from "../icons";
import { WidgetSize } from "../../store/dashboardStore";
import { Skeleton } from "../Skeleton";

interface WidgetCardProps {
  title: string;
  icon: React.ReactNode;
  onClick?: () => void;
  badge?: number;
  children: React.ReactNode;
  className?: string;
  size?: WidgetSize;
  compactContent?: React.ReactNode; // Optional compact view content
  isLoading?: boolean; // Optional loading state
}

export const WidgetCard: React.FC<WidgetCardProps> = ({
  title,
  icon,
  onClick,
  badge,
  children,
  className = "",
  size = "full",
  compactContent,
  isLoading = false,
}) => {
  const isCompact = size === "compact";

  if (isLoading) {
    return (
      <div
        className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm ${isCompact ? "p-3" : "p-4"} ${className}`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-4 w-4" />
          </div>
          {!isCompact && (
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
              <Skeleton className="h-3 w-4/6" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      whileHover={{
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm cursor-pointer hover:shadow-xl group ${isCompact ? "p-3" : "p-4"} ${className}`}
      style={{
        transition: "box-shadow 0.3s ease",
      }}
    >
      <div
        className={`flex items-center ${isCompact ? "justify-center" : "justify-between mb-3"}`}
      >
        <h3
          className={`font-bold text-slate-800 dark:text-white flex items-center gap-2 ${isCompact ? "text-sm" : ""}`}
        >
          {icon}
          {!isCompact && title}
          {badge !== undefined && badge > 0 && (
            <motion.span
              className={`bg-brand/10 text-brand px-2 py-0.5 rounded-full ${isCompact ? "text-xs" : "text-xs"}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {badge}
            </motion.span>
          )}
        </h3>
        {!isCompact && (
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRightIcon className="h-4 w-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>
        )}
      </div>
      {isCompact
        ? compactContent || (
            <div className="text-center">
              <div className="text-2xl font-black text-slate-800 dark:text-white">
                {badge || 0}
              </div>
            </div>
          )
        : children}
    </motion.div>
  );
};
