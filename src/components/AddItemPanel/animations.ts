/**
 * AddItemPanel Animation Configurations
 * Premium spring physics and micro-interaction animations
 */

// Spring physics for panel entrance
export const panelSpring = {
  type: "spring" as const,
  damping: 25,
  stiffness: 300,
  mass: 0.5,
};

// Panel slide animation
export const panelVariants = {
  hidden: {
    y: "100%",
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: panelSpring,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// Backdrop overlay animation
export const backdropVariants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: {
    opacity: 1,
    backdropFilter: "blur(8px)",
    transition: { duration: 0.3 },
  },
  exit: {
    opacity: 0,
    backdropFilter: "blur(0px)",
    transition: { duration: 0.2 },
  },
};

// Staggered children animation
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", damping: 20, stiffness: 300 },
  },
};

// Tab underline slide animation
export const tabIndicatorVariants = {
  animate: (customX: number) => ({
    x: customX,
    transition: { type: "spring", damping: 30, stiffness: 400 },
  }),
};

// Priority color transitions
export const priorityColors = {
  Low: {
    bg: "rgba(34, 197, 94, 0.15)",
    border: "#22c55e",
    text: "#22c55e",
  },
  Medium: {
    bg: "rgba(245, 158, 11, 0.15)",
    border: "#f59e0b",
    text: "#f59e0b",
  },
  High: {
    bg: "rgba(239, 68, 68, 0.15)",
    border: "#ef4444",
    text: "#ef4444",
  },
};

// Energy level battery fill animation
export const energyColors = {
  Low: "#94a3b8",
  Medium: "#22c55e",
  High: "#3b82f6",
  Peak: "#f59e0b",
};

// Item type colors
export const itemTypeColors = {
  Task: { primary: "#6366f1", secondary: "#818cf8", icon: "✓" },
  Habit: { primary: "#10b981", secondary: "#34d399", icon: "↻" },
  Event: { primary: "#f59e0b", secondary: "#fbbf24", icon: "📅" },
  Goal: { primary: "#eab308", secondary: "#facc15", icon: "🎯" },
  Routine: { primary: "#a855f7", secondary: "#c084fc", icon: "⚡" },
  Note: { primary: "#64748b", secondary: "#94a3b8", icon: "📝" },
};

// Category colors
export const categoryColors = {
  Work: "#3b82f6",
  Personal: "#a855f7",
  Fitness: "#22c55e",
  Learning: "#f59e0b",
  Home: "#f97316",
  None: "#64748b",
};

// Success confetti configuration
export const confettiConfig = {
  particleCount: 100,
  spread: 70,
  origin: { y: 0.9 },
  colors: ["#6366f1", "#8b5cf6", "#a855f7", "#fbbf24"],
};

// Button hover/press animations
export const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Success checkmark draw animation
export const checkmarkVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

// Chip/pill bounce animation
export const chipVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", damping: 15, stiffness: 400 },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

// AI sparkle pulse animation
export const sparkleVariants = {
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 180, 360],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Voice input glow rings
export const voiceActiveVariants = {
  animate: {
    boxShadow: [
      "0 0 0 0 rgba(239, 68, 68, 0.4)",
      "0 0 0 10px rgba(239, 68, 68, 0)",
    ],
    transition: {
      duration: 1,
      repeat: Infinity,
    },
  },
};
