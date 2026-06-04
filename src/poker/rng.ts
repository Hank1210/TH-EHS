export interface RandomSource {
  next(): number;
}

export function createSeededRandom(seedText: string): RandomSource {
  let seed = 2166136261;
  for (const char of seedText) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }

  return {
    next(): number {
      seed += 0x6d2b79f5;
      let value = seed;
      value = Math.imul(value ^ (value >>> 15), value | 1);
      value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
      return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
    }
  };
}

export function sampleWithoutReplacement<T>(items: readonly T[], count: number, random: RandomSource): T[] {
  const pool = [...items];
  const sample: T[] = [];

  for (let index = 0; index < count; index += 1) {
    const selectedIndex = Math.floor(random.next() * pool.length);
    const selected = pool[selectedIndex];
    if (selected === undefined) {
      throw new Error("Unable to sample from an empty pool");
    }
    sample.push(selected);
    pool.splice(selectedIndex, 1);
  }

  return sample;
}
