'use strict';

/**
 * Multi-Vital Verification System
 * Prevents alerts caused by a single-vital spike.
 */

function classifyEvent({ vitals = {}, thresholds = {}, baselineFlags = {}, persistent = {} } = {}) {
    const hr = Number(vitals.heartRate);
    const sp = Number(vitals.spo2);
    const tp = Number(vitals.temperature);

    const hrHi = (thresholds.heartRate && Number(thresholds.heartRate.max)) || 120;
    const spLo = (thresholds.spo2 && Number(thresholds.spo2.min)) || 90;
    const tpHi = (thresholds.temperature && Number(thresholds.temperature.max)) || 38.5;

    const hrAb = Number.isFinite(hr) && hr > hrHi;
    const spAb = Number.isFinite(sp) && sp < spLo;
    const tpAb = Number.isFinite(tp) && tp > tpHi;

    const abnormalCount = [hrAb, spAb, tpAb].filter(Boolean).length;

    const baselineOutCount = Object.values(baselineFlags || {}).filter(Boolean).length;

    const persistentCount = Object.values(persistent || {}).filter(Boolean).length;

    // Single HR spike with other vitals normal => stress event
    if (hrAb && !spAb && !tpAb && persistentCount === 0) {
        return {
            classification: 'temporary_stress_event',
            abnormalCount,
            baselineOutCount,
            persistentCount,
            rationale: 'HR spike without corroborating SpO2/Temperature abnormality',
        };
    }

    // Multiple vitals abnormal or persistent abnormality -> true risk
    if (abnormalCount >= 2 || persistentCount >= 1) {
        return {
            classification: 'multi_vital_abnormal',
            abnormalCount,
            baselineOutCount,
            persistentCount,
            rationale: abnormalCount >= 2 ? 'Multiple vitals abnormal' : 'Abnormality persists beyond buffer threshold',
        };
    }

    // Baseline says out-of-range but thresholds not crossed: mild deviation
    if (baselineOutCount >= 1 && abnormalCount === 0) {
        return {
            classification: 'baseline_deviation',
            abnormalCount,
            baselineOutCount,
            persistentCount,
            rationale: 'Vitals deviating from personal baseline',
        };
    }

    return {
        classification: 'normal',
        abnormalCount,
        baselineOutCount,
        persistentCount,
        rationale: 'No corroborated abnormality',
    };
}

module.exports = {
    classifyEvent,
};
