import bingoTable from "@/data/bingotable.json";

/** Full card table from bingotable.json */
export const dbCards = bingoTable;

/** Highest card id / total selectable cards */
export const TOTAL_CARDS = bingoTable.length;

/** Valid card ids (1 .. TOTAL_CARDS) */
export function isValidCardId(n) {
  const num = Number(n);
  return Number.isInteger(num) && num >= 1 && num <= TOTAL_CARDS;
}
