import pokersolver from "pokersolver";
import type { CardCode, HandState } from "../types/poker.js";

const { Hand } = pokersolver;

export function compareHands(heroCards: readonly CardCode[], villainCards: readonly CardCode[], boardCards: readonly CardCode[]): HandState {
  const hero = Hand.solve([...heroCards, ...boardCards]);
  const villain = Hand.solve([...villainCards, ...boardCards]);
  const winners = Hand.winners([hero, villain]);

  const heroWins = winners.includes(hero);
  const villainWins = winners.includes(villain);

  if (heroWins && villainWins) {
    return "tied";
  }

  return heroWins ? "ahead" : "behind";
}

export function handStrengthFromCounts(ahead: number, tied: number, behind: number): number {
  const total = ahead + tied + behind;
  if (total === 0) {
    return 0;
  }
  return (ahead + tied / 2) / total;
}
