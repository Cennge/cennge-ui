/**
 * The average of each value and the ones before it, `window` in all: a trend through noisy daily readings,
 * such as body weight. Missing values (null) are skipped; a place with none in its window stays null.
 */
export function movingAverage(values: readonly (number | null | undefined)[], window: number): (number | null)[] {
  const size = Number.isFinite(window) ? Math.max(1, Math.floor(window)) : window === Infinity ? values.length || 1 : 1;
  return values.map((_, index) => {
    let sum = 0;
    let count = 0;
    for (let i = Math.max(0, index - size + 1); i <= index; i++) {
      const value = values[i];
      if (typeof value === "number" && Number.isFinite(value)) {
        sum += value;
        count += 1;
      }
    }
    return count ? sum / count : null;
  });
}
