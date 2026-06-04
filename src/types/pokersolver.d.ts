declare module "pokersolver" {
  class Hand {
    static solve(cards: string[]): Hand;
    static winners(hands: Hand[]): Hand[];
  }

  const pokersolver: {
    Hand: typeof Hand;
  };

  export default pokersolver;
}
