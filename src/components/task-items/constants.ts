import React from "react";
import { Priority, TagType } from "../../types";
import { UserIcon, AtSymbolIcon, BoltIcon } from "../icons";

export const priorityClasses: {
  [key in Priority]: {
    bg: string;
    text: string;
    ring: string;
    gradient: string;
  };
} = {
  [Priority.HIGH]: {
    bg: "bg-red-100 dark:bg-red-900/30",
    text: "text-red-800 dark:text-red-200",
    ring: "ring-red-200 dark:ring-red-800",
    gradient: "from-red-500 to-orange-500",
  },
  [Priority.MEDIUM]: {
    bg: "bg-yellow-100 dark:bg-yellow-900/30",
    text: "text-yellow-800 dark:text-yellow-200",
    ring: "ring-yellow-200 dark:ring-yellow-800",
    gradient: "from-yellow-500 to-amber-500",
  },
  [Priority.LOW]: {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-800 dark:text-green-200",
    ring: "ring-green-200 dark:ring-green-800",
    gradient: "from-green-500 to-emerald-500",
  },
};

export const tagClasses: {
  [key in TagType]: {
    bg: string;
    text: string;
    icon: React.FC<React.ComponentProps<"svg">>;
    gradient: string;
  };
} = {
  [TagType.STANDARD]: {
    bg: "bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-sm",
    text: "text-slate-700 dark:text-slate-300",
    icon: () => null,
    gradient: "from-slate-400 to-slate-500",
  },
  [TagType.PERSON]: {
    bg: "bg-sky-100/80 dark:bg-sky-900/40 backdrop-blur-sm",
    text: "text-sky-800 dark:text-sky-200",
    icon: UserIcon,
    gradient: "from-sky-400 to-blue-500",
  },
  [TagType.CONTEXT]: {
    bg: "bg-teal-100/80 dark:bg-teal-900/40 backdrop-blur-sm",
    text: "text-teal-800 dark:text-teal-200",
    icon: AtSymbolIcon,
    gradient: "from-teal-400 to-cyan-500",
  },
  [TagType.ENERGY]: {
    bg: "bg-amber-100/80 dark:bg-amber-900/40 backdrop-blur-sm",
    text: "text-amber-800 dark:text-amber-200",
    icon: BoltIcon,
    gradient: "from-amber-400 to-orange-500",
  },
};

export const formatDate = (
  dateString: string | undefined | null,
  locale: string,
) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  } catch (e) {
    return null;
  }
};

export const formatTime = (
  dateString: string | undefined | null,
  locale: string,
) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (e) {
    return null;
  }
};
