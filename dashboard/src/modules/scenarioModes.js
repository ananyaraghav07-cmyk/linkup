// Scenario modes (wrapper-only)
// Pure transformations for demo simulations.

export const SCENARIO_MODES = Object.freeze({
    normal: 'normal',
    heart_rate_spike: 'heart_rate_spike',
    oxygen_drop: 'oxygen_drop',
    fever_spike: 'fever_spike',
});

export function applyScenarioToVitals(vitals, mode = SCENARIO_MODES.normal) {
    const v = { ...(vitals || {}) };

    switch (mode) {
        case SCENARIO_MODES.heart_rate_spike:
            if (typeof v.heartRate === 'number') v.heartRate = Math.round(v.heartRate + 35);
            break;
        case SCENARIO_MODES.oxygen_drop:
            if (typeof v.spo2 === 'number') v.spo2 = Math.max(70, Math.round(v.spo2 - 8));
            break;
        case SCENARIO_MODES.fever_spike:
            if (typeof v.temperature === 'number') v.temperature = Math.min(41, +(v.temperature + 1.2).toFixed(1));
            break;
        default:
            break;
    }

    return v;
}
