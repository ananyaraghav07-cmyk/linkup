'use strict';

/**
 * Monitoring Pipeline
 * End-to-end read-only analysis for a vitals packet.
 *
 * Input: { patientId, timestamp, vitals: {heartRate, spo2, temperature}, ... }
 * Input also takes buffers (per patient) maintained by caller.
 */

const { baselineDeviation, normalizeBaseline, DEFAULT_BASELINE } = require('./baselineEngine');
const { analyzeTrends } = require('./trendAnalyzer');
const { evaluateSpikeFiltering, isOutOfRange } = require('./spikeFilter');
const { classifyEvent } = require('./multiVitalVerification');
const { computeRiskScore } = require('./riskEngine');
const { computeAlertConfidence } = require('./alertConfidence');
const { computeStabilityIndex } = require('./stabilityIndex');
const { generateInsights } = require('./insightsGenerator');
const { shouldStartCooldown } = require('./cooldownEngine');

function buildAbnormalFlags(vitals, thresholds) {
    const hr = Number(vitals?.heartRate);
    const sp = Number(vitals?.spo2);
    const tp = Number(vitals?.temperature);

    const hrRange = thresholds?.heartRate || { min: 0, max: 120 };
    const spo2Range = thresholds?.spo2 || { min: 90, max: 100 };
    const tempRange = thresholds?.temperature || { min: 35.5, max: 38.5 };

    return {
        heartRateAbnormal: isOutOfRange(hr, hrRange),
        spo2Abnormal: isOutOfRange(sp, spo2Range),
        temperatureAbnormal: isOutOfRange(tp, tempRange),
    };
}

/**
 * Analyze one packet.
 * buffers: { hrPoints, spo2Points, tempPoints } where points are [{t, v}] recent window.
 */
function analyzeVitalsPacket(packet, { buffers = {}, thresholds = {}, baseline = DEFAULT_BASELINE, persistMs = 30_000, cooldownMs = 60_000 } = {}) {
    const vitals = packet?.vitals || {};

    const hrPoints = buffers.hrPoints || [];
    const spo2Points = buffers.spo2Points || [];
    const tempPoints = buffers.tempPoints || [];

    const baselineNorm = normalizeBaseline(baseline);
    const baselineDev = baselineDeviation(vitals, baselineNorm);

    const spike = evaluateSpikeFiltering(
        { hrPoints, spo2Points, tempPoints },
        { thresholds, persistMs }
    );

    const abnormalFlags = buildAbnormalFlags(vitals, thresholds);

    const trend = analyzeTrends({ hrPoints, spo2Points, tempPoints });

    const classification = classifyEvent({
        vitals,
        thresholds,
        baselineFlags: baselineDev.flags,
        persistent: spike.persistent,
    });

    const risk = computeRiskScore({
        vitals,
        abnormalFlags,
        baselineDeviation: baselineDev,
        trend,
        eventClassification: classification.classification,
    });

    const confidence = computeAlertConfidence({
        abnormalFlags,
        spike,
        baselineDeviation: baselineDev,
        trend,
        eventClassification: classification.classification,
    });

    const stability = computeStabilityIndex({
        heartRateSeries: hrPoints.map((p) => p.v),
        spo2Series: spo2Points.map((p) => p.v),
        temperatureSeries: tempPoints.map((p) => p.v),
    });

    const cooldown = shouldStartCooldown(
        { eventClassification: classification.classification, confidenceAction: confidence.action },
        { cooldownMs }
    );

    const insights = generateInsights({
        vitals,
        hrPoints,
        spo2Points,
        tempPoints,
        trend,
        stability,
    });

    return {
        classification,
        baseline: baselineDev,
        spike,
        trend,
        risk,
        confidence,
        stability,
        cooldown,
        insights,
        // Suggested alert action (read-only):
        suggestedAlert: confidence.action,
    };
}

module.exports = {
    analyzeVitalsPacket,
};
