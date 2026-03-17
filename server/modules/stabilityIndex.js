'use strict';

/**
 * Health Stability Index (0-100)
 * High score means stable vitals (low fluctuation).
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

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function computeStabilityIndex({ heartRateSeries = [], spo2Series = [], temperatureSeries = [] } = {}) {
    const hrSd = stddev(heartRateSeries);
    const spSd = stddev(spo2Series);
    const tpSd = stddev(temperatureSeries);

    // Convert SD to penalty. Typical variation tolerances:
    // HR SD 0..15 => 0..50 penalty
    // SpO2 SD 0..3 => 0..30 penalty
    // Temp SD 0..0.8 => 0..20 penalty
    const hrPenalty = hrSd === null ? 0 : clamp((hrSd / 15) * 50, 0, 50);
    const spPenalty = spSd === null ? 0 : clamp((spSd / 3) * 30, 0, 30);
    const tpPenalty = tpSd === null ? 0 : clamp((tpSd / 0.8) * 20, 0, 20);

    const stability = clamp(Math.round(100 - (hrPenalty + spPenalty + tpPenalty)), 0, 100);

    let label = 'Stable';
    if (stability < 40) label = 'Unstable';
    else if (stability < 70) label = 'Variable';

    return { stability, label, penalties: { hrPenalty, spPenalty, tpPenalty } };
}

module.exports = {
    computeStabilityIndex,
};
