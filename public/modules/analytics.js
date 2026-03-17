// Frontend analytics helpers (Vanilla JS)
// Read-only computations for vitals.

export function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

export function mean(values) {
    const nums = (values || []).map(Number).filter(Number.isFinite);
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export function stddev(values) {
    const m = mean(values);
    if (m === null) return null;
    const nums = (values || []).map(Number).filter(Number.isFinite);
    const variance = nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / nums.length;
    return Math.sqrt(variance);
}

export function slopePerMinute(points) {
    const pts = (points || [])
        .map((p) => ({ t: Number(p.t), v: Number(p.v) }))
        .filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v));

    if (pts.length < 2) return 0;
    const t0 = pts[0].t;
    const xs = pts.map((p) => (p.t - t0) / 60000);
    const ys = pts.map((p) => p.v);

    const xMean = mean(xs);
    const yMean = mean(ys);
    if (xMean === null || yMean === null) return 0;

    let num = 0;
    let den = 0;
    for (let i = 0; i < xs.length; i++) {
        num += (xs[i] - xMean) * (ys[i] - yMean);
        den += (xs[i] - xMean) ** 2;
    }
    if (den === 0) return 0;
    return num / den;
}

export function stabilityIndex({ heartRateSeries = [], spo2Series = [], temperatureSeries = [] } = {}) {
    const hrSd = stddev(heartRateSeries);
    const spSd = stddev(spo2Series);
    const tpSd = stddev(temperatureSeries);

    const hrPenalty = hrSd === null ? 0 : clamp((hrSd / 15) * 50, 0, 50);
    const spPenalty = spSd === null ? 0 : clamp((spSd / 3) * 30, 0, 30);
    const tpPenalty = tpSd === null ? 0 : clamp((tpSd / 0.8) * 20, 0, 20);

    const stability = clamp(Math.round(100 - (hrPenalty + spPenalty + tpPenalty)), 0, 100);
    let label = 'Stable';
    if (stability < 40) label = 'Unstable';
    else if (stability < 70) label = 'Variable';

    return { stability, label };
}
