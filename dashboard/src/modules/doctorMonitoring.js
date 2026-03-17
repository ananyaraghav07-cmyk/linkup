// Doctor monitoring helpers for the React dashboard (ESM)
//
// Goals:
// - Lightweight computations over existing in-memory history buffers
// - No backend/API changes required
// - Supports simulator mode (multi-patient) and socket mode (single patient)

import { analyzeVitals } from './insightsEngine';

function safeNumber(n) {
    const x = Number(n);
    return Number.isFinite(x) ? x : null;
}

function formatTime(isoOrString) {
    if (!isoOrString) return null;
    try {
        return new Date(isoOrString).toLocaleTimeString();
    } catch {
        return String(isoOrString);
    }
}

function buildPointsFromSeries(series, nowMs) {
    const values = (series || []).slice(-60).map(Number).filter(Number.isFinite);
    const n = values.length;
    return values.map((v, i) => ({
        t: nowMs - (n - 1 - i) * 1000,
        v,
    }));
}

function pickEarlySignals(analysis) {
    const flags = analysis?.trend?.flags || {};
    const signals = [];
    if (flags.hrGradualIncrease) signals.push('Gradual heart rate increase');
    if (flags.spo2DriftDown) signals.push('Oxygen saturation drifting down');
    if (flags.tempRising) signals.push('Temperature trending upward');
    return signals;
}

function computeSummary({ patientId, history }) {
    const hr = (history?.heartRate || []).slice(-60).map(Number).filter(Number.isFinite);
    const sp = (history?.spo2 || []).slice(-60).map(Number).filter(Number.isFinite);
    const tp = (history?.temperature || []).slice(-60).map(Number).filter(Number.isFinite);

    const hrSpikes = hr.filter((v) => v >= 120).length;
    const oxygenDrops = sp.filter((v) => v < 92).length;
    const fevers = tp.filter((v) => v >= 38.5).length;

    const parts = [];
    if (hrSpikes) parts.push(`${hrSpikes} heart rate spike${hrSpikes === 1 ? '' : 's'}`);
    if (oxygenDrops) parts.push(`${oxygenDrops} oxygen drop${oxygenDrops === 1 ? '' : 's'}`);
    if (fevers) parts.push(`${fevers} fever reading${fevers === 1 ? '' : 's'}`);

    const windowLabel = 'past minute';
    const summary = parts.length
        ? `Patient ${patientId} had ${parts.join(' and ')} in the ${windowLabel}.`
        : `Patient ${patientId} remained stable in the ${windowLabel}.`;

    return { summary, stats: { hrSpikes, oxygenDrops, fevers } };
}

function toAlertLevel({ status, earlyRisk }) {
    if (status === 'critical') return 'Critical';
    if (status === 'warning') return 'High Risk';
    if (earlyRisk) return 'Warning';
    return null;
}

function riskToIndicator(riskScore) {
    if (riskScore >= 70) return { label: 'Critical', color: 'red' };
    if (riskScore >= 30) return { label: 'Moderate', color: 'yellow' };
    return { label: 'Stable', color: 'green' };
}

/**
 * Compute doctor-focused metrics for a patient.
 *
 * @param {object} params
 * @param {object} params.patient Patient data (same shape used across dashboard)
 * @param {object} params.history History arrays {timestamps, heartRate, spo2, temperature}
 */
export function computeDoctorMetrics({ patient, history }) {
    if (!patient?.patientId) return null;

    const nowMs = Date.now();
    const buffers = {
        hrPoints: buildPointsFromSeries(history?.heartRate, nowMs),
        spo2Points: buildPointsFromSeries(history?.spo2, nowMs),
        tempPoints: buildPointsFromSeries(history?.temperature, nowMs),
    };

    const vitals = {
        heartRate: safeNumber(patient?.vitals?.heartRate),
        spo2: safeNumber(patient?.vitals?.spo2),
        temperature: safeNumber(patient?.vitals?.temperature),
    };

    const analysis = analyzeVitals({ vitals, buffers });

    const riskScore = analysis?.risk?.score ?? 0;
    const stabilityScore = analysis?.stability?.stability ?? 0;

    const earlySignals = pickEarlySignals(analysis);
    const earlyRisk = earlySignals.length >= 2 || (earlySignals.length >= 1 && stabilityScore < 60);

    const summary = computeSummary({ patientId: patient.patientId, history });

    const alertLevel = toAlertLevel({ status: patient.status, earlyRisk });
    const lastAlertTime = (patient?.alerts && patient.alerts.length) ? formatTime(patient.timestamp) : null;

    return {
        patientId: patient.patientId,
        riskScore,
        statusIndicator: riskToIndicator(riskScore),
        stabilityScore,
        earlyRisk,
        earlySignals,
        summary: summary.summary,
        summaryStats: summary.stats,
        alertLevel,
        lastAlertTime,
        updatedAt: formatTime(patient.timestamp),
    };
}

/**
 * Used for ordering patients in multi-patient views.
 */
export function getPatientRiskSortValue({ patient, metrics }) {
    if (metrics && typeof metrics.riskScore === 'number') return metrics.riskScore;
    const status = patient?.status;
    if (status === 'critical') return 90;
    if (status === 'warning') return 55;
    return 0;
}
