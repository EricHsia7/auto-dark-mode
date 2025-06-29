export interface Stats {
  n: number;
  avg: [number, number, number];
  stdev: [number, number, number];
}

export function computeStats(colors: number[][]): Stats {
  const n = colors.length;
  let RG_total = 0,
    GB_total = 0,
    BR_total = 0;
  let RG_sq = 0,
    GB_sq = 0,
    BR_sq = 0;

  for (const c of colors) {
    const [prg, pgb, pbr] = p(c);
    RG_total += prg;
    RG_sq += prg ** 2;
    GB_total += pgb;
    GB_sq += pgb ** 2;
    BR_total += pbr;
    BR_sq += pbr ** 2;
  }

  const RG_avg = RG_total / n;
  const GB_avg = GB_total / n;
  const BR_avg = BR_total / n;

  const RG_stdev = Math.sqrt(RG_sq / n - RG_avg ** 2);
  const GB_stdev = Math.sqrt(GB_sq / n - GB_avg ** 2);
  const BR_stdev = Math.sqrt(BR_sq / n - BR_avg ** 2);

  return {
    n,
    avg: [RG_avg, GB_avg, BR_avg],
    stdev: [RG_stdev, GB_stdev, BR_stdev]
  };
}

export function mergeStats(avg1: number, stdev1: number, n1: number, avg2: number, stdev2: number, n2: number): [number, number] {
  const merged_n = n1 + n2;
  const merged_avg = (n1 * avg1 + n2 * avg2) / merged_n;
  const merged_var = (n1 * (stdev1 ** 2 + avg1 ** 2) + n2 * (stdev2 ** 2 + avg2 ** 2)) / merged_n - merged_avg ** 2;
  return [merged_avg, Math.sqrt(merged_var)];
}
