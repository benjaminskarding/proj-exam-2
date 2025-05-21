/** Returns true if the two date ranges overlap */
export function overlap(a1: Date, a2: Date, b1: Date, b2: Date): boolean {
  return a1 <= b2 && b1 <= a2;
}
