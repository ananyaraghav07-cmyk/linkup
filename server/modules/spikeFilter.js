'use strict';

/**
 * Duration-Based Spike Filtering
 * Evaluates whether an abnormal vital is a short spike or a persistent abnormality.
 */

function isOutOfRange(value, { min = -Infinity, max = Infinity } = {}) {
    const n = Number(value);
    if (!Number.isFinite(n)) return false;
    return n < min || n > max;
}

/**
 * Compute consecutive abnormal duration ending at the latest point.
 * points: [{t, v}] sorted by time ascending.
 */
function consecutiveAbnormalMs(points, range) {
    const pts = (points || []).map((p) => ({ t: Number(p.t), v: Number(p.v) })).filter((p) => Number.isFinite(p.t) && Number.isFinite(p.v));
    if (pts.length < 2) return 0;

    let duration = 0;
    for (let i = pts.length - 1; i > 0; i--) {
        const currAb = isOutOfRange(pts[i].v, range);
        const prevAb = isOutOfRange(pts[i - 1].v, range);
        if (!currAb) break;
        if (!prevAb) {
            duration += Math.max(0, pts[i].t - pts[i - 1].t);
            break;
        }
        duration += Math.max(0, pts[i].t - pts[i - 1].t);
    }
    return duration;
}

function evaluateSpikeFiltering({ hrPoints = [], spo2Points = [], tempPoints = [] } = {}, { thresholds = {}, persistMs = 30_000 } = {}) {
    const t = thresholds;

    const hrRange = t.heartRate || { min: 0, max: 120 };             // default abnormal if >120
    const spo2Range = t.spo2 || { min: 90, max: 100 };               // abnormal if <90
    const tempRange = t.temperature || { min: 35.5, max: 38.5 };      // abnormal if >38.5

    const hrAbMs = consecutiveAbnormalMs(hrPoints, hrRange);
    const spo2AbMs = consecutiveAbnormalMs(spo2Points, spo2Range);
    const tempAbMs = consecutiveAbnormalMs(tempPoints, tempRange);

    const hrPersistent = hrAbMs >= persistMs;
    const spo2Persistent = spo2AbMs >= persistMs;
    const tempPersistent = tempAbMs >= persistMs;

    return {
        persistMs,
        durationsMs: { heartRate: hrAbMs, spo2: spo2AbMs, temperature: tempAbMs },
        persistent: { heartRate: hrPersistent, spo2: spo2Persistent, temperature: tempPersistent },
    };
}

module.exports = {
    evaluateSpikeFiltering,
    consecutiveAbnormalMs,
    isOutOfRange,
};
