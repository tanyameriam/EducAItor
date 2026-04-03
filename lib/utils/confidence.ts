import type { Criterion } from "@/lib/store/useGradingStore";

export const confidenceOrder: Record<string, number> = {
  Minimal: 0,
  Weak: 1,
  Partial: 2,
  Strong: 3,
};

export function getWorstConfidence(criteria: Criterion[]): string {
  if (!criteria.length) return "Strong";
  let worst = 3;
  for (const c of criteria) {
    const val = confidenceOrder[c.confidence] ?? 3;
    if (val < worst) worst = val;
  }
  const entry = Object.entries(confidenceOrder).find(([, v]) => v === worst);
  return entry ? entry[0] : "Strong";
}

export function confidenceToColor(
  confidence: string
): "success" | "warning" | "danger" | "default" {
  switch (confidence) {
    case "Strong":
      return "success";
    case "Partial":
      return "default";
    case "Weak":
      return "warning";
    case "Minimal":
      return "danger";
    default:
      return "default";
  }
}
