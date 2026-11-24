import { useState, useCallback, useEffect } from "react";
import { useTaskAnalytics } from "./useTaskAnalytics";
import { PlannerItem } from "../types";

interface TimeEstimate {
  suggestedMinutes: number;
  confidence: "low" | "medium" | "high";
  basedOnSamples: number;
  optimismBias?: number; // Percentage (positive = you underestimate)
  message: string;
}

/**
 * Hook for smart time estimation based on historical patterns
 */
export function useTimeEstimation() {
  const { getAverageDuration, getCategoryPatterns } = useTaskAnalytics();

  /**
   * Get smart time estimate for a task
   */
  const getTimeEstimate = useCallback(
    async (item: Partial<PlannerItem>): Promise<TimeEstimate | null> => {
      try {
        // Try to get average for this category
        const categoryAvg = item.category
          ? await getAverageDuration(item.category)
          : null;

        // If we have category data
        if (categoryAvg !== null) {
          const currentEstimate = item.estimatedMinutes || 30;
          const difference = categoryAvg - currentEstimate;
          const diffPercent =
            currentEstimate > 0
              ? Math.round((difference / currentEstimate) * 100)
              : 0;

          // Get category patterns for sample count
          const patterns = item.category
            ? await getCategoryPatterns(item.category)
            : [];
          const sampleCount = patterns.filter((p) => p.actualMinutes).length;

          // Determine confidence based on sample size
          let confidence: "low" | "medium" | "high" = "low";
          if (sampleCount >= 10) confidence = "high";
          else if (sampleCount >= 5) confidence = "medium";

          // Build message
          let message = `Based on ${sampleCount} similar task${sampleCount !== 1 ? "s" : ""}`;

          if (Math.abs(diffPercent) > 30) {
            // Significant optimism bias detected
            if (diffPercent > 0) {
              message = `⚠️ You usually take ${categoryAvg}min for "${item.category}" tasks (${diffPercent}% longer than estimated)`;
            } else {
              message = `ℹ️ You usually finish "${item.category}" tasks faster (avg ${categoryAvg}min)`;
            }
          }

          return {
            suggestedMinutes: categoryAvg,
            confidence,
            basedOnSamples: sampleCount,
            optimismBias: Math.abs(diffPercent) > 10 ? diffPercent : undefined,
            message,
          };
        }

        // No data available
        return null;
      } catch (error) {
        console.error("Failed to get time estimate:", error);
        return null;
      }
    },
    [getAverageDuration, getCategoryPatterns],
  );

  /**
   * Get optimism bias for a category
   * Returns percentage: positive = user underestimates, negative = overestimates
   */
  const getOptimismBias = useCallback(
    async (category: string): Promise<number | null> => {
      try {
        const patterns = await getCategoryPatterns(category);

        const validPatterns = patterns.filter(
          (p) =>
            p.estimatedMinutes && p.actualMinutes && p.estimatedMinutes > 0,
        );

        if (validPatterns.length < 3) return null;

        // Calculate average bias
        const biases = validPatterns.map((p) => {
          const diff = p.actualMinutes! - p.estimatedMinutes!;
          return (diff / p.estimatedMinutes!) * 100;
        });

        const avgBias = biases.reduce((sum, b) => sum + b, 0) / biases.length;
        return Math.round(avgBias);
      } catch (error) {
        console.error("Failed to calculate optimism bias:", error);
        return null;
      }
    },
    [getCategoryPatterns],
  );

  /**
   * Check if estimate seems unrealistic based on history
   */
  const validateEstimate = useCallback(
    async (
      item: Partial<PlannerItem>,
    ): Promise<{ valid: boolean; warning?: string }> => {
      const estimate = await getTimeEstimate(item);

      if (!estimate) {
        return { valid: true }; // No data to validate against
      }

      const currentEstimate = item.estimatedMinutes || 30;
      const difference = Math.abs(estimate.suggestedMinutes - currentEstimate);
      const diffPercent = (difference / estimate.suggestedMinutes) * 100;

      // Warn if estimate differs by more than 50%
      if (diffPercent > 50 && estimate.confidence !== "low") {
        const warning =
          currentEstimate < estimate.suggestedMinutes
            ? `⚠️ This seems optimistic. Similar tasks took ${estimate.suggestedMinutes}min on average.`
            : `ℹ️ You're being conservative. Similar tasks took ${estimate.suggestedMinutes}min on average.`;

        return { valid: false, warning };
      }

      return { valid: true };
    },
    [getTimeEstimate],
  );

  return {
    getTimeEstimate,
    getOptimismBias,
    validateEstimate,
  };
}
