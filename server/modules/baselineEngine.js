'use strict';

/**
 * Baseline Engine
 * - Keeps per-user baseline ranges.
 * - Baseline is an *additional* validation layer (does not replace current thresholds).
 */

const DEFAULT_BASELINE = Object.freeze({
    heartRate: { min: 60, max: 90 },
    spo2: { min: 95, max: 100 },
    temperature: { min: 36.0, max: 37.5 },
});

function normalizeBaseline(baseline) {
    const b = baseline || {};

    const hr = b.heartRate || {};
    const sp = b.spo2 || {};
    const tp = b.temperature || {};

    return {
        heartRate: {
            min: Number.isFinite(Number(hr.min)) ? Number(hr.min) : DEFAULT_BASELINE.heartRate.min,
            max: Number.isFinite(Number(hr.max)) ? Number(hr.max) : DEFAULT_BASELINE.heartRate.max,
        },
        spo2: {
            min: Number.isFinite(Number(sp.min)) ? Number(sp.min) : DEFAULT_BASELINE.spo2.min,
            max: Number.isFinite(Number(sp.max)) ? Number(sp.max) : DEFAULT_BASELINE.spo2.max,
        },
        temperature: {
            min: Number.isFinite(Number(tp.min)) ? Number(tp.min) : DEFAULT_BASELINE.temperature.min,
            max: Number.isFinite(Number(tp.max)) ? Number(tp.max) : DEFAULT_BASELINE.temperature.max,
        },
    };
}

function withinRange(value, range) {
    if (!Number.isFinite(Number(value))) return false;
    return value >= range.min && value <= range.max;
}

function deviationFromRange(value, range) {
    if (!Number.isFinite(Number(value))) return 0;
    if (value < range.min) return range.min - value;
    if (value > range.max) return value - range.max;
    return 0;
}

function baselineDeviation(vitals, baseline) {
    const b = normalizeBaseline(baseline);
    const v = vitals || {};

    const hr = Number(v.heartRate);
    const spo2 = Number(v.spo2);
    const temp = Number(v.temperature);

    return {
        heartRate: deviationFromRange(hr, b.heartRate),
        spo2: deviationFromRange(spo2, b.spo2),
        temperature: deviationFromRange(temp, b.temperature),
        flags: {
            heartRateOutOfBaseline: !withinRange(hr, b.heartRate),
            spo2OutOfBaseline: !withinRange(spo2, b.spo2),
            temperatureOutOfBaseline: !withinRange(temp, b.temperature),
        },
        baseline: b,
    };
}

/**
 * Optional: derive baseline from a stable window.
 * Uses percentiles-ish trimming to avoid spikes.
 */
function deriveBaselineFromWindow({ heartRateSeries = [], spo2Series = [], temperatureSeries = [] } = {}) {
    const robustRange = (arr, { low = 0.1, high = 0.9, pad = 0 } = {}) => {
        const numbers = (arr || []).map(Number).filter(Number.isFinite).sort((a, b) => a - b);
        if (!numbers.length) return null;
        const loIdx = Math.floor((numbers.length - 1) * low);
        const hiIdx = Math.floor((numbers.length - 1) * high);
        const min = numbers[loIdx] - pad;
        const max = numbers[hiIdx] + pad;
        return { min, max };
    };

    const hr = robustRange(heartRateSeries, { low: 0.15, high: 0.85, pad: 5 }) || DEFAULT_BASELINE.heartRate;
    const sp = robustRange(spo2Series, { low: 0.15, high: 0.9, pad: 1 }) || DEFAULT_BASELINE.spo2;
    const tp = robustRange(temperatureSeries, { low: 0.15, high: 0.85, pad: 0.2 }) || DEFAULT_BASELINE.temperature;

    return normalizeBaseline({ heartRate: hr, spo2: sp, temperature: tp });
}

module.exports = {
    DEFAULT_BASELINE,
    normalizeBaseline,
    baselineDeviation,
    deriveBaselineFromWindow,
};
