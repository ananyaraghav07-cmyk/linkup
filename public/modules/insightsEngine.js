// Smart insights engine (Vanilla JS)
// Designed to read existing vitals/history and produce insights + risk/confidence.

import { clamp, slopePerMinute, mean, stabilityIndex } from './analytics.js';

export const DEFAULT_BASELINE = {
    heartRate: { min: 60, max: 90 },
    spo2: { min: 95, max: 100 },
    temperature: { min: 36.0, max: 37.5 },
};

export function normalizeBaseline(baseline = {}) {
    const b = baseline || {};
    return {
        heartRate: {
            min: Number.isFinite(+b.heartRate?.min) ? +b.heartRate.min : DEFAULT_BASELINE.heartRate.min,
            max: Number.isFinite(+b.heartRate?.max) ? +b.heartRate.max : DEFAULT_BASELINE.heartRate.max,
        },
        spo2: {
            min: Number.isFinite(+b.spo2?.min) ? +b.spo2.min : DEFAULT_BASELINE.spo2.min,
            max: Number.isFinite(+b.spo2?.max) ? +b.spo2.max : DEFAULT_BASELINE.spo2.max,
        },
        temperature: {
            min: Number.isFinite(+b.temperature?.min) ? +b.temperature.min : DEFAULT_BASELINE.temperature.min,
            max: Number.isFinite(+b.temperature?.max) ? +b.temperature.max : DEFAULT_BASELINE.temperature.max,
        },
    };
}

function within(value, range) {
    const n = Number(value);
    return Number.isFinite(n) && n >= range.min && n <= range.max;
}

function outOfRange(value, range) {
    const n = Number(value);
    return Number.isFinite(n) && (n < range.min || n > range.max);
}

function consecutiveAbnormalMs(points, range) {
    const pts = (points || []).map(p => ({ t: +p.t, v: +p.v })).filter(p => Number.isFinite(p.t) && Number.isFinite(p.v));
    if (pts.length < 2) return 0;
    let d = 0;
    for (let i = pts.length - 1; i > 0; i--) {
        const curr = outOfRange(pts[i].v, range);
        const prev = outOfRange(pts[i - 1].v, range);
        if (!curr) break;
        d += Math.max(0, pts[i].t - pts[i - 1].t);
        if (!prev) break;
    }
    return d;
}

export function analyzeVitals({ vitals, buffers, baseline, thresholds, persistMs = 30000 } = {}) {
    const v = vitals || {};
    const b = normalizeBaseline(baseline);

    const t = thresholds || {
        heartRate: { min: 0, max: 120 },
        spo2: { min: 90, max: 100 },
        temperature: { min: 35.5, max: 38.5 },
    };

    const hrPoints = buffers?.hrPoints || [];
    const spo2Points = buffers?.spo2Points || [];
    const tempPoints = buffers?.tempPoints || [];

    const abnormalFlags = {
        heartRateAbnormal: outOfRange(v.heartRate, t.heartRate),
        spo2Abnormal: outOfRange(v.spo2, t.spo2),
        temperatureAbnormal: outOfRange(v.temperature, t.temperature),
    };

    const baselineFlags = {
        heartRateOutOfBaseline: !within(v.heartRate, b.heartRate),
        spo2OutOfBaseline: !within(v.spo2, b.spo2),
        temperatureOutOfBaseline: !within(v.temperature, b.temperature),
    };

    const spike = {
        durationsMs: {
            heartRate: consecutiveAbnormalMs(hrPoints, t.heartRate),
            spo2: consecutiveAbnormalMs(spo2Points, t.spo2),
            temperature: consecutiveAbnormalMs(tempPoints, t.temperature),
        },
    };

    const persistent = {
        heartRate: spike.durationsMs.heartRate >= persistMs,
        spo2: spike.durationsMs.spo2 >= persistMs,
        temperature: spike.durationsMs.temperature >= persistMs,
    };

    const trend = {
        slopesPerMinute: {
            heartRate: slopePerMinute(hrPoints),
            spo2: slopePerMinute(spo2Points),
            temperature: slopePerMinute(tempPoints),
        },
    };

    const trendFlags = {
        hrGradualIncrease: trend.slopesPerMinute.heartRate >= 10,
        spo2DriftDown: trend.slopesPerMinute.spo2 <= -2,
        tempRising: trend.slopesPerMinute.temperature >= 0.5,
    };

    const eventClassification = (() => {
        const abnormalCount = Object.values(abnormalFlags).filter(Boolean).length;
        const persistentCount = Object.values(persistent).filter(Boolean).length;

        if (abnormalFlags.heartRateAbnormal && !abnormalFlags.spo2Abnormal && !abnormalFlags.temperatureAbnormal && persistentCount === 0) {
            return 'temporary_stress_event';
        }
        if (abnormalCount >= 2 || persistentCount >= 1) return 'multi_vital_abnormal';
        if (Object.values(baselineFlags).filter(Boolean).length >= 1 && abnormalCount === 0) return 'baseline_deviation';
        return 'normal';
    })();

    const trendAnomalyCount = Object.values(trendFlags).filter(Boolean).length;

    // Risk score
    let riskScore = 0;
    if (abnormalFlags.heartRateAbnormal) riskScore += 20;
    if (abnormalFlags.spo2Abnormal) riskScore += 40;
    if (abnormalFlags.temperatureAbnormal) riskScore += 20;
    if (Object.values(abnormalFlags).filter(Boolean).length >= 2) riskScore += 10;
    if (trendAnomalyCount > 0) riskScore += 10;
    if (Object.values(baselineFlags).filter(Boolean).length > 0 && Object.values(abnormalFlags).filter(Boolean).length === 0) riskScore += 10;
    if (eventClassification === 'temporary_stress_event') riskScore = Math.floor(riskScore * 0.35);
    riskScore = clamp(riskScore, 0, 100);

    let riskLevel = 'Stable';
    if (riskScore >= 70) riskLevel = 'Critical';
    else if (riskScore >= 30) riskLevel = 'Moderate';

    // Confidence
    let confidence = 0;
    confidence += Object.values(abnormalFlags).filter(Boolean).length * 22;
    confidence += Object.values(persistent).filter(Boolean).length * 18;
    confidence += Object.values(baselineFlags).filter(Boolean).length * 8;
    confidence += trendAnomalyCount * 10;
    if (eventClassification === 'temporary_stress_event') confidence -= 25;
    confidence = clamp(Math.round(confidence), 0, 100);

    let alertAction = 'ignore';
    if (confidence > 70) alertAction = 'emergency';
    else if (confidence >= 40) alertAction = 'warning';

    const stability = stabilityIndex({
        heartRateSeries: hrPoints.map(p => p.v),
        spo2Series: spo2Points.map(p => p.v),
        temperatureSeries: tempPoints.map(p => p.v),
    });

    const insights = [];
    if (trendFlags.hrGradualIncrease) insights.push('Gradual heart rate increase detected across multiple readings.');
    if (trendFlags.spo2DriftDown) insights.push('Oxygen saturation shows a downward drift across multiple readings.');
    if (trendFlags.tempRising) insights.push('Temperature is trending upward across multiple readings.');
    if (stability?.stability != null) insights.push(`Stability Index: ${stability.stability}/100 (${stability.label}).`);
    if (!insights.length) insights.push('Vitals look consistent in the recent window.');

    return {
        eventClassification,
        abnormalFlags,
        baselineFlags,
        spike: { ...spike, persistent, persistMs },
        trend: { ...trend, flags: trendFlags, trendAnomalyCount },
        risk: { score: riskScore, level: riskLevel },
        confidence: { confidence, action: alertAction },
        stability,
        insights,
    };
}
