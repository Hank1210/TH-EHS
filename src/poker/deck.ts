import { RANKS, SUITS, type CardCode } from "../types/poker.js";

export const FULL_DECK: readonly CardCode[] = Object.freeze(
  RANKS.flatMap((rank) => SUITS.map((suit) => `${rank}${suit}` as CardCode))
);

export function remainingDeck(knownCards: readonly CardCode[]): CardCode[] {
  const known = new Set(knownCards);
  return FULL_DECK.filter((card) => !known.has(card));
}

export function combinations<T>(items: readonly T[], size: number): T[][] {
  const result: T[][] = [];

  function visit(start: number, current: T[]): void {
    if (current.length === size) {
      result.push([...current]);
      return;
    }

    const remainingSlots = size - current.length;
    for (let index = start; index <= items.length - remainingSlots; index += 1) {
      const item = items[index];
      if (item === undefined) {
        continue;
      }
      current.push(item);
      visit(index + 1, current);
      current.pop();
    }
  }

  visit(0, []);
  return result;
}
