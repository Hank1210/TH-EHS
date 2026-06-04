import pokersolver from "pokersolver";
import type { CardCode, HandState } from "../types/poker.js";

const { Hand } = pokersolver;
type SolvedHand = ReturnType<typeof Hand.solve>;

const handCache = new Map<string, SolvedHand>();

export function compareHands(heroCards: readonly CardCode[], villainCards: readonly CardCode[], boardCards: readonly CardCode[]): HandState {
  const hero = solveCached([...heroCards, ...boardCards]);
  const villain = solveCached([...villainCards, ...boardCards]);
  const winners = Hand.winners([hero, villain]);

  const heroWins = winners.includes(hero);
  const villainWins = winners.includes(villain);

  if (heroWins && villainWins) {
    return "tied";
  }

  return heroWins ? "ahead" : "behind";
}

function solveCached(cards: readonly CardCode[]): SolvedHand {
  const key = [...cards].sort().join("");
  const cached = handCache.get(key);
  if (cached) {
    return cached;
  }

  const solved = Hand.solve([...cards]);
  handCache.set(key, solved);
  return solved;
}

export function handStrengthFromCounts(ahead: number, tied: number, behind: number): number {
  const total = ahead + tied + behind;
  if (total === 0) {
    return 0;
  }
  return (ahead + tied / 2) / total;
}
