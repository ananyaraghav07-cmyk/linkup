'use strict';

/**
 * Alert Confidence Engine (0-100)
 * Uses abnormal vitals count, duration persistence, baseline deviation, and trend anomalies.
 */

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function computeAlertConfidence({
    abnormalFlags = {},
    spike = {},
    baselineDeviation = {},
    trend = {},
    eventClassification = 'normal',
} = {}) {
    const flags = abnormalFlags || {};
    const persistent = (spike && spike.persistent) || {};

    const abnormalCount = [flags.heartRateAbnormal, flags.spo2Abnormal, flags.temperatureAbnormal].filter(Boolean).length;
    const persistentCount = Object.values(persistent).filter(Boolean).length;

    const baselineOutCount = Object.values((baselineDeviation.flags || {})).filter(Boolean).length;
    const trendAnomalyCount = Number(trend.trendAnomalyCount || 0);

    // Start with corroboration
    let confidence = 0;
    confidence += abnormalCount * 22;
    confidence += persistentCount * 18;
    confidence += baselineOutCount * 8;
    confidence += trendAnomalyCount * 10;

    // Penalize single-vital spikes
    if (eventClassification === 'temporary_stress_event') confidence -= 25;

    // Clamp
    confidence = clamp(Math.round(confidence), 0, 100);

    let action = 'ignore';
    if (confidence > 70) action = 'emergency';
    else if (confidence >= 40) action = 'warning';

    return { confidence, action };
}

module.exports = {
    computeAlertConfidence,
};
