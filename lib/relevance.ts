/**
 * Data Relevance Calculator
 * Weights recent data higher than old data (2+ years considered outdated)
 */

export interface RelevanceScore {
  weight: number; // 0 to 1, where 1 is most relevant
  ageInDays: number;
  category: "recent" | "relevant" | "outdated";
  daysAgo: number;
}

export const OFFICIAL_BASELINE_WEIGHT = 0.7;

/**
 * Calculate relevance weight based on data age
 * - Data < 6 months old: weight = 1.0 (most relevant)
 * - Data 6-12 months old: weight = 0.9
 * - Data 1-2 years old: weight = 0.6
 * - Data > 2 years old: weight = 0.2 (mostly outdated)
 */
export function calculateRelevanceWeight(
  submittedDate: Date | string
): RelevanceScore {
  const submitted = new Date(submittedDate);
  const now = new Date();
  const ageInDays = Math.floor((now.getTime() - submitted.getTime()) / (1000 * 60 * 60 * 24));

  let weight: number;
  let category: "recent" | "relevant" | "outdated";

  if (ageInDays <= 180) {
    // 0-6 months
    weight = 1.0;
    category = "recent";
  } else if (ageInDays <= 365) {
    // 6-12 months
    weight = 0.9;
    category = "recent";
  } else if (ageInDays <= 730) {
    // 1-2 years
    weight = 0.6;
    category = "relevant";
  } else if (ageInDays <= 1095) {
    // 2-3 years
    weight = 0.3;
    category = "outdated";
  } else {
    // > 3 years
    weight = 0.1;
    category = "outdated";
  }

  return {
    weight,
    ageInDays,
    category,
    daysAgo: ageInDays,
  };
}

export function getReportWeight(
  report: { submittedAt: Date | string; isOfficial?: boolean },
  officialWeight: number = OFFICIAL_BASELINE_WEIGHT
): number {
  if (report.isOfficial) return officialWeight;
  return calculateRelevanceWeight(report.submittedAt).weight;
}

/**
 * Calculate weighted average of days
 * Example: [30, 60, 90] with weights [1.0, 0.9, 0.2] = (30*1.0 + 60*0.9 + 90*0.2) / (1.0 + 0.9 + 0.2)
 */
export function calculateWeightedAverage(
  days: number[],
  weights: number[]
): number {
  if (days.length === 0) return 0;
  if (days.length !== weights.length) {
    throw new Error("Days and weights arrays must have same length");
  }

  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;

  const weightedSum = days.reduce((sum, day, i) => sum + day * weights[i], 0);
  return Math.round(weightedSum / totalWeight);
}

/**
 * Get a readable label for data age
 */
export function getDataAgeLabel(ageInDays: number): string {
  if (ageInDays < 30) return "Just now";
  if (ageInDays < 90) return `${Math.floor(ageInDays / 7)} weeks ago`;
  if (ageInDays < 365) return `${Math.floor(ageInDays / 30)} months ago`;
  if (ageInDays < 730) return `${Math.floor(ageInDays / 365)} year ago`;
  return `${Math.floor(ageInDays / 365)} years ago`;
}

/**
 * Get color/badge style based on relevance
 */
export function getRelevanceBadgeStyle(
  category: "recent" | "relevant" | "outdated"
): { bg: string; text: string; icon: string } {
  switch (category) {
    case "recent":
      return {
        bg: "#d4edda", // Light green
        text: "#155724", // Dark green
        icon: "check-circle", // Green checkmark circle
      };
    case "relevant":
      return {
        bg: "#fff3cd", // Light yellow
        text: "#856404", // Dark yellow
        icon: "alert-circle", // Yellow alert circle
      };
    case "outdated":
      return {
        bg: "#f8d7da", // Light red
        text: "#721c24", // Dark red
        icon: "x-circle", // Red X circle
      };
  }
}
