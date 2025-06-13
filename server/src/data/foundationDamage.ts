import type { FoundationType } from "../types.js";

const damageByType: Record<FoundationType, number[]> = {
  "Slab-on-Grade (1‑story)": [
    0, 3, 6, 8, 11, 14, 17, 19, 22, 25, 28, 31, 33, 36, 39, 42, 44, 47, 50,
  ],
  "Crawlspace/Pier (1‑story elevated)": [
    0, 3, 5, 8, 10, 13, 15, 18, 20, 23, 25, 28, 30, 33, 35, 38, 40, 43, 45,
  ],
  "Basement (1‑story)": [
    0, 3, 7, 10, 13, 17, 20, 23, 27, 30, 33, 37, 40, 43, 47, 50, 53, 57, 60,
  ],
  "Two‑story Slab": [
    0, 2, 4, 7, 9, 11, 13, 16, 18, 20, 22, 24, 27, 29, 31, 33, 36, 38, 40,
  ],
  "Two‑story Basement": [
    0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 31, 34, 37, 40, 43, 46, 49, 52, 55,
  ],
};

export function getDamage(depth: number, foundation: FoundationType): number {
  const d = Math.round(depth);
  const idx = Math.min(18, Math.max(0, d));
  return damageByType[foundation][idx];
}
