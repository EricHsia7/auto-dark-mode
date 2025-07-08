export interface Stats {
  n: number;
  avg: [number, number, number];
  stdev: [number, number, number];
}

// Compute per-channel differences: |R - G|, |G - B|, |B - R|
export function getPerChannelDifference(r: number, g: number, b: number): [RG: number, GB: number, BR: number] {
  return [Math.abs(r - g), Math.abs(g - b), Math.abs(b - r)];
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
    const [prg, pgb, pbr] = getPerChannelDifference(c[0], c[1], c[2]);
    RG_total += prg;
    RG_sq += Math.pow(prg, 2);
    GB_total += pgb;
    GB_sq += Math.pow(pgb, 2);
    BR_total += pbr;
    BR_sq += Math.pow(pbr, 2);
  }

  const RG_avg = RG_total / n;
  const GB_avg = GB_total / n;
  const BR_avg = BR_total / n;

  const RG_stdev = Math.sqrt(RG_sq / n - Math.pow(RG_avg, 2));
  const GB_stdev = Math.sqrt(GB_sq / n - Math.pow(GB_avg, 2));
  const BR_stdev = Math.sqrt(BR_sq / n - Math.pow(BR_avg, 2));

  return {
    n,
    avg: [RG_avg, GB_avg, BR_avg],
    stdev: [RG_stdev, GB_stdev, BR_stdev]
  };
}

export function mergeStats(avg1: number, stdev1: number, n1: number, avg2: number, stdev2: number, n2: number): [number, number] {
  const merged_n = n1 + n2;
  const merged_avg = (n1 * avg1 + n2 * avg2) / merged_n;
  const merged_var = (n1 * (Math.pow(stdev1, 2) + Math.pow(avg1, 2)) + n2 * (Math.pow(stdev2, 2) + Math.pow(avg2, 2))) / merged_n - Math.pow(merged_avg, 2);
  return [merged_avg, Math.sqrt(merged_var)];
}
