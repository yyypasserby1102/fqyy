let rngState = 0x12345678;

function nextSeededRandom(): number {
  rngState = (1664525 * rngState + 1013904223) >>> 0;
  return rngState / 0x100000000;
}

export function setRandomSeed(seed: number): void {
  rngState = seed >>> 0;
}

export function randomFloat(): number {
  return nextSeededRandom();
}

export function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat() * (max - min + 1)) + min;
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(randomFloat() * items.length)];
}

export function pickUniqueRandom<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const result: T[] = [];

  while (pool.length > 0 && result.length < count) {
    const index = Math.floor(randomFloat() * pool.length);
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}
