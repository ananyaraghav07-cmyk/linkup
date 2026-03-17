'use strict';

/**
 * Trend Analyzer
 * Computes moving averages, slopes, and stability metrics from time-series.
 */

function mean(values) {
    const nums = (values || []).map(Number).filter(Number.isFinite);
    if (!nums.length) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function stddev(values) {
    const m = mean(values);
    if (m === null) return null;
    const nums = (values || []).map(Number).filter(Number.isFinite);
    const variance = nums.reduce((acc, x) => acc + (x - m) ** 2, 0) / nums.length;
    return Math.sqrt(variance);
}

/**
 * Simple linear regression slope for points [{t, v}].
 * Returns slope per minute (normalized).
 */
function slopePerMinute(points) {
    const pts = (points || []).map((p) => ({ t: Number(p.t), v: Number(p.v) })).filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v));
    if (pts.length < 2) return 0;

    const t0 = pts[0].t;
    const xs = pts.map((p) => (p.t - t0) / 60_000); // minutes
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

function movingAverage(points) {
    return mean((points || []).map((p) => p.v));
}

function analyzeTrends({ hrPoints = [], spo2Points = [], tempPoints = [] } = {}) {
    const hrAvg = movingAverage(hrPoints);
    const spo2Avg = movingAverage(spo2Points);
    const tempAvg = movingAverage(tempPoints);

    const hrSlope = slopePerMinute(hrPoints);
    const spo2Slope = slopePerMinute(spo2Points);
    const tempSlope = slopePerMinute(tempPoints);

    const spo2Stability = (() => {
        const sd = stddev(spo2Points.map((p) => p.v));
        if (sd === null) return null;
        // Lower sd -> higher stability. Map 0..5 to 100..0 (clamp).
        const score = 100 - Math.min(100, (sd / 5) * 100);
        return Math.max(0, Math.min(100, score));
    })();

    const trendFlags = {
        hrGradualIncrease: hrSlope >= 10,           // +10 bpm/min
        hrGradualDecrease: hrSlope <= -10,
        spo2DriftDown: spo2Slope <= -2,            // -2 %/min
        tempRising: tempSlope >= 0.5,              // +0.5 C/min
    };

    const trendAnomalyCount = Object.values(trendFlags).filter(Boolean).length;

    return {
        averages: { heartRate: hrAvg, spo2: spo2Avg, temperature: tempAvg },
        slopesPerMinute: { heartRate: hrSlope, spo2: spo2Slope, temperature: tempSlope },
        stability: { spo2: spo2Stability },
        flags: trendFlags,
        trendAnomalyCount,
    };
}

module.exports = {
    analyzeTrends,
    slopePerMinute,
    mean,
    stddev,
};
