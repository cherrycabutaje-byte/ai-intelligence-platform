import React from "react";
import type { ProductAnalysis } from "@/types/database";

interface Props {
  product: ProductAnalysis | null;
}

export function ProductIntelligenceCard({ product }: Props) {
  if (!product) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">
          Product Intelligence
        </h2>

        <p className="text-zinc-400">
          No product analysis available.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
      <h2 className="mb-4 text-lg font-semibold text-white">
        Product Intelligence
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase text-zinc-500">
            Product Title
          </p>
          <p className="text-white">
            {product.product_title}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase text-zinc-500">
              Market Score
            </p>
            <p className="text-2xl font-bold text-indigo-400">
              {product.market_score ?? 0}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase text-zinc-500">
              Opportunity Score
            </p>
            <p className="text-2xl font-bold text-emerald-400">
              {product.opportunity_score ?? 0}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500">
            Next Product Idea
          </p>
          <p className="text-white">
            {product.next_product_idea}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase text-zinc-500">
            Product Gap
          </p>
          <p className="text-zinc-300">
            {product.product_gap}
          </p>
        </div>
      </div>
    </div>
  );
}