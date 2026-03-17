'use strict';

/**
 * Smart Health Insights
 * Generates human-readable insights from current vitals and recent history/trends.
 */

function pctChange(current, prev) {
    const c = Number(current);
    const p = Number(prev);
    if (!Number.isFinite(c) || !Number.isFinite(p) || p === 0) return null;
    return ((c - p) / p) * 100;
}

function lastValue(points) {
    if (!points || !points.length) return null;
    return points[points.length - 1].v;
}

function firstValue(points) {
    if (!points || !points.length) return null;
    return points[0].v;
}

function generateInsights({ vitals = {}, hrPoints = [], spo2Points = [], tempPoints = [], trend = {}, stability = {} } = {}) {
    const insights = [];

    const hrNow = Number(vitals.heartRate);
    const spNow = Number(vitals.spo2);
    const tpNow = Number(vitals.temperature);

    // Percent change vs first in window
    const hrStart = firstValue(hrPoints);
    const spStart = firstValue(spo2Points);
    const tpStart = firstValue(tempPoints);

    const hrPct = pctChange(hrNow, hrStart);
    if (hrPct !== null && Math.abs(hrPct) >= 10) {
        const dir = hrPct > 0 ? 'increased' : 'decreased';
        insights.push(`Heart rate ${dir} by ${Math.round(Math.abs(hrPct))}% compared to earlier readings.`);
    }

    const spPct = pctChange(spNow, spStart);
    if (spPct !== null && Math.abs(spPct) >= 2) {
        const dir = spPct > 0 ? 'increased' : 'decreased';
        insights.push(`Oxygen level ${dir} by ${Math.round(Math.abs(spPct))}% compared to earlier readings.`);
    }

    if (trend?.stability?.spo2 !== null && typeof trend?.stability?.spo2 === 'number') {
        if (trend.stability.spo2 >= 80) insights.push('Oxygen level has remained stable in the recent window.');
        else if (trend.stability.spo2 <= 50) insights.push('Oxygen level is fluctuating noticeably in the recent window.');
    }

    if (trend?.flags?.hrGradualIncrease) {
        insights.push('Gradual heart rate increase detected across multiple readings.');
    }
    if (trend?.flags?.spo2DriftDown) {
        insights.push('Oxygen saturation shows a downward drift across multiple readings.');
    }
    if (trend?.flags?.tempRising) {
        insights.push('Temperature is trending upward across multiple readings.');
    }

    if (typeof stability?.stability === 'number') {
        insights.push(`Stability Index: ${stability.stability}/100 (${stability.label}).`);
    }

    // Always include a simple snapshot if no other insights
    if (!insights.length) {
        const hr = Number.isFinite(hrNow) ? hrNow : '--';
        const sp = Number.isFinite(spNow) ? `${spNow}%` : '--';
        const tp = Number.isFinite(tpNow) ? `${tpNow.toFixed(1)}°C` : '--';
        insights.push(`Vitals snapshot: HR ${hr}, SpO2 ${sp}, Temp ${tp}.`);
    }

    return insights;
}

module.exports = {
    generateInsights,
};
