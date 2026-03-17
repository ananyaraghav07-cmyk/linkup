// Health Event Simulation Modes (wrapper-only)
// This module does NOT modify the existing simulator.
// It provides a pure function you can apply to *readings* to simulate scenarios.

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
