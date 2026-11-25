import React from "react";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  size?: "sm" | "md" | "lg";
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "py-4 px-4",
    md: "py-8 px-6",
    lg: "py-16 px-8",
  };

  const iconSizeClasses = {
    sm: "text-3xl mb-2",
    md: "text-5xl mb-3",
    lg: "text-6xl mb-4",
  };

  const titleClasses = {
    sm: "text-sm font-semibold",
    md: "text-base font-bold",
    lg: "text-xl font-bold",
  };

  return (
    <motion.div
      className={`text-center text-slate-500 dark:text-slate-400 ${sizeClasses[size]}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={iconSizeClasses[size]}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        {icon}
      </motion.div>
      <h3
        className={`${titleClasses[size]} text-slate-700 dark:text-slate-300 mb-1`}
      >
        {title}
      </h3>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {actionLabel && onAction && (
        <motion.button
          onClick={onAction}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="inline-flex items-center justify-center px-3 py-1.5 bg-gradient-to-r from-brand to-purple-600 hover:shadow-lg text-white text-xs rounded-lg transition font-semibold"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default EmptyState;
