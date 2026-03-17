'use strict';

/**
 * Risk Score Engine (0-100)
 * Computes score based on abnormal vitals, trend anomalies, baseline deviation, and multi-vital corroboration.
 */

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function computeRiskScore({
    vitals = {},
    abnormalFlags = {},
    baselineDeviation = {},
    trend = {},
    eventClassification = 'normal',
} = {}) {
    const flags = abnormalFlags || {};
    const deviations = baselineDeviation || {};
    const trendFlags = (trend && trend.flags) || {};

    let score = 0;

    // Base abnormal vitals scoring
    if (flags.heartRateAbnormal) score += 20;
    if (flags.spo2Abnormal) score += 40;
    if (flags.temperatureAbnormal) score += 20;

    const abnormalCount = [flags.heartRateAbnormal, flags.spo2Abnormal, flags.temperatureAbnormal].filter(Boolean).length;
    if (abnormalCount >= 2) score += 10;

    // Trend anomaly bonus
    const trendAnomalyCount = Number(trend.trendAnomalyCount || 0);
    if (trendAnomalyCount > 0) score += 10;

    // Baseline deviation adds mild risk (additional validation layer)
    const baselineOutCount = Object.values((deviations.flags || {})).filter(Boolean).length;
    if (baselineOutCount > 0 && abnormalCount === 0) score += 10;

    // Down-weight temporary stress events
    if (eventClassification === 'temporary_stress_event') {
        score = Math.floor(score * 0.35);
    }

    score = clamp(score, 0, 100);

    let level = 'Stable';
    if (score >= 70) level = 'Critical';
    else if (score >= 30) level = 'Moderate';

    return { score, level };
}

module.exports = {
    computeRiskScore,
};
