import { EnergyLevel } from "../types";

/**
 * Calculate energy match score between task energy and current energy
 * Returns: 0 (perfect match) to 3 (total mismatch)
 */
export function getEnergyMatchDiff(
  taskEnergy: EnergyLevel | undefined,
  currentEnergy: EnergyLevel,
): number {
  const energyLevels = {
    [EnergyLevel.PEAK]: 4,
    [EnergyLevel.HIGH]: 3,
    [EnergyLevel.MEDIUM]: 2,
    [EnergyLevel.LOW]: 1,
  };

  if (!taskEnergy) return 1; // Neutral if no energy requirement

  const taskValue = energyLevels[taskEnergy];
  const currentValue = energyLevels[currentEnergy];

  return Math.abs(taskValue - currentValue);
}

/**
 * Get visual indicator class for energy match
 */
export function getEnergyMatchClass(diff: number): string {
  switch (diff) {
    case 0:
      // Perfect match - green glow
      return "ring-2 ring-green-400 shadow-lg shadow-green-500/50";
    case 1:
      // Close match - subtle glow
      return "ring-1 ring-yellow-300";
    case 2:
      // Mismatch - warning
      return "ring-1 ring-orange-300 opacity-80";
    case 3:
      // Total mismatch - faded
      return "ring-1 ring-red-300 opacity-60";
    default:
      return "";
  }
}

/**
 * Get energy match message
 */
export function getEnergyMatchMessage(diff: number): string | null {
  switch (diff) {
    case 0:
      return "✨ Perfect for your current energy";
    case 1:
      return null; // Close enough, no message needed
    case 2:
      return "⚠️ Consider doing this later";
    case 3:
      return "🕐 Save for when you have more energy";
    default:
      return null;
  }
}
