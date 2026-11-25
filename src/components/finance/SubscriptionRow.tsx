import React from "react";
import { Subscription } from "../../types";
import { TrashIcon } from "../icons";

interface SubscriptionRowProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
}

export const SubscriptionRow: React.FC<SubscriptionRowProps> = ({
  subscription,
  onDelete,
}) => {
  const isUpcoming =
    new Date(subscription.nextBillingDate) <=
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const getSubscriptionBrand = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("netflix"))
      return { icon: "🍿", bg: "bg-[#E50914]", text: "text-white" };
    if (n.includes("spotify"))
      return { icon: "🎵", bg: "bg-[#1DB954]", text: "text-white" };
    if (n.includes("amazon") || n.includes("prime"))
      return { icon: "📦", bg: "bg-[#00A8E1]", text: "text-white" };
    if (n.includes("disney"))
      return { icon: "🏰", bg: "bg-[#113CCF]", text: "text-white" };
    if (n.includes("youtube"))
      return { icon: "▶️", bg: "bg-[#FF0000]", text: "text-white" };
    if (n.includes("apple"))
      return { icon: "🍎", bg: "bg-[#A2AAAD]", text: "text-white" };
    if (n.includes("gym") || n.includes("fitness") || n.includes("planet"))
      return { icon: "🏋️‍♀️", bg: "bg-[#FF5A00]", text: "text-white" };
    if (
      n.includes("xbox") ||
      n.includes("playstation") ||
      n.includes("nintendo") ||
      n.includes("game")
    )
      return { icon: "🎮", bg: "bg-[#107C10]", text: "text-white" };
    if (
      n.includes("cloud") ||
      n.includes("drive") ||
      n.includes("dropbox") ||
      n.includes("google one")
    )
      return { icon: "☁️", bg: "bg-[#0061FF]", text: "text-white" };
    if (n.includes("adobe") || n.includes("creative"))
      return { icon: "🎨", bg: "bg-[#FF0000]", text: "text-white" };
    if (
      n.includes("chatgpt") ||
      n.includes("openai") ||
      n.includes("midjourney") ||
      n.includes("ai")
    )
      return { icon: "🤖", bg: "bg-[#10A37F]", text: "text-white" };
    if (n.includes("hbo") || n.includes("max"))
      return { icon: "🍿", bg: "bg-[#5822B4]", text: "text-white" };
    if (n.includes("hulu"))
      return { icon: "📺", bg: "bg-[#1CE783]", text: "text-[#272C35]" };
    if (n.includes("patreon"))
      return { icon: "🧡", bg: "bg-[#FF424D]", text: "text-white" };
    if (n.includes("github") || n.includes("copilot"))
      return { icon: "💻", bg: "bg-[#181717]", text: "text-white" };

    // Default generic
    return {
      icon: subscription.icon || "📱",
      bg: "bg-slate-100 dark:bg-slate-700",
      text: "text-slate-600 dark:text-slate-300",
    };
  };

  const brand = getSubscriptionBrand(subscription.name);

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all group">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${brand.bg} ${brand.text}`}
        >
          {brand.icon}
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-white">
            {subscription.name}
          </h4>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="capitalize">{subscription.billingCycle}</span>
            <span>•</span>
            <span className={isUpcoming ? "text-amber-500 font-medium" : ""}>
              Renews{" "}
              {new Date(subscription.nextBillingDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-slate-800 dark:text-white">
            ${subscription.amount.toFixed(2)}
          </p>
          <span
            className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              subscription.status === "active"
                ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {subscription.status}
          </span>
        </div>
        <button
          onClick={() => onDelete(subscription.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
          title="Remove Subscription"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
