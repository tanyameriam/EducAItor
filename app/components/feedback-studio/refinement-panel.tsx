"use client";

import { RefinementVariant } from "@/lib/store/useGradingStore";

interface RefinementPanelProps {
  variants: RefinementVariant[];
  selectedVariantId: string | null;
  onSelectVariant: (variantId: string) => void;
  onApply: () => void;
  onCancel: () => void;
}

export function RefinementPanel({
  variants,
  selectedVariantId,
  onSelectVariant,
  onApply,
  onCancel,
}: RefinementPanelProps) {
  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-semibold text-foreground">Refine Feedback</h3>
        <p className="text-xs text-muted">Select a preset to adjust the feedback style</p>
      </div>

      <div className="space-y-2">
        {variants.map((variant) => (
          <button
            key={variant.id}
            onClick={() => onSelectVariant(variant.id)}
            className={`w-full text-left p-3 rounded-lg border transition-colors ${
              selectedVariantId === variant.id
                ? 'bg-accent/10 border-accent'
                : 'bg-surface border-border/50 hover:border-border'
            }`}
          >
            <p className="font-medium text-sm text-foreground">{variant.name}</p>
            <p className="text-xs text-muted">{variant.description}</p>
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-lg text-sm border border-border/50 hover:border-border text-foreground"
        >
          Cancel
        </button>
        <button
          onClick={onApply}
          disabled={!selectedVariantId}
          className="flex-1 px-4 py-2 rounded-lg text-sm bg-accent text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  );
}
