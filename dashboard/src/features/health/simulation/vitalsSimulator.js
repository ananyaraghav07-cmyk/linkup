/**
 * LifeLink Twin - Vitals Simulation Engine
 *
 * Extracted from App.jsx to keep UI and domain logic separate.
 * The output shape is intentionally backward-compatible with existing UI.
 */

const DEFAULT_CONDITION = 'Cardiac';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const lerp = (current, target, speed) => current + (target - current) * speed;

const clampInt = (value, min, max) => Math.round(clamp(value, min, max));

const WORSEN_DEFAULT_DURATION_MS = 60_000;

const createScenarios = () => ({
  Cardiac: [
    { name: 'Stable', duration: 45, targets: { hr: 76, spo2: 97, temp: 36.7 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
    { name: 'Slight Elevation', duration: 20, targets: { hr: 88, spo2: 96, temp: 36.9 }, variability: { hr: 3, spo2: 0.5, temp: 0.05 } },
    { name: 'Mild Stress', duration: 15, targets: { hr: 98, spo2: 95, temp: 37.0 }, variability: { hr: 3, spo2: 1, temp: 0.1 } },
    { name: 'Recovery', duration: 30, targets: { hr: 80, spo2: 97, temp: 36.8 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
  ],
  Trauma: [
    { name: 'Stable', duration: 45, targets: { hr: 80, spo2: 97, temp: 36.6 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
    { name: 'Pain Response', duration: 18, targets: { hr: 92, spo2: 96, temp: 36.8 }, variability: { hr: 3, spo2: 0.5, temp: 0.05 } },
    { name: 'Elevated', duration: 12, targets: { hr: 105, spo2: 94, temp: 37.0 }, variability: { hr: 4, spo2: 1, temp: 0.1 } },
    { name: 'Stabilizing', duration: 35, targets: { hr: 82, spo2: 97, temp: 36.7 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
  ],
  Respiratory: [
    { name: 'Stable', duration: 40, targets: { hr: 74, spo2: 96, temp: 36.8 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
    { name: 'Slight Distress', duration: 20, targets: { hr: 82, spo2: 94, temp: 37.0 }, variability: { hr: 3, spo2: 1, temp: 0.05 } },
    { name: 'Mild Hypoxia', duration: 15, targets: { hr: 92, spo2: 91, temp: 37.1 }, variability: { hr: 3, spo2: 1, temp: 0.1 } },
    { name: 'Improving', duration: 35, targets: { hr: 76, spo2: 96, temp: 36.9 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
  ],
  Stroke: [
    { name: 'Stable', duration: 45, targets: { hr: 72, spo2: 97, temp: 36.7 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
    { name: 'Slight Change', duration: 20, targets: { hr: 82, spo2: 96, temp: 36.9 }, variability: { hr: 3, spo2: 0.5, temp: 0.05 } },
    { name: 'Elevated', duration: 15, targets: { hr: 95, spo2: 94, temp: 37.2 }, variability: { hr: 4, spo2: 1, temp: 0.1 } },
    { name: 'Monitoring', duration: 35, targets: { hr: 75, spo2: 97, temp: 36.8 }, variability: { hr: 2, spo2: 0.5, temp: 0.05 } },
  ],
});

/**
 * Very subtle natural variability (like real monitors).
 */
const addNaturalVariability = (value, range, seed) => {
  const time = Date.now() / 1000;
  const sineVar = Math.sin(time * 0.15 + seed) * (range * 0.5);
  const randomVar = (Math.random() - 0.5) * range * 0.3;
  return value + sineVar + randomVar;
};

/**
 * Factory that keeps per-patient simulation state.
 */
export function createVitalsSimulator() {
  const scenariosByCondition = createScenarios();
  const patientStates = new Map();

  const ensureState = (patientId, condition) => {
    const safeId = patientId || 'unknown';
    const scenarios = getScenariosFor(condition || DEFAULT_CONDITION);
    const existing = patientStates.get(safeId);
    if (existing) return existing;

    const init = {
      currentHR: scenarios[0].targets.hr,
      currentSpo2: scenarios[0].targets.spo2,
      currentTemp: scenarios[0].targets.temp,
      scenarioIndex: 0,
      scenarioTimer: 0,
      worsenUntilMs: 0,
      worsenStartedAtMs: 0,
    };
    patientStates.set(safeId, init);
    return init;
  };

  const getScenariosFor = (condition) => {
    return scenariosByCondition[condition] || scenariosByCondition[DEFAULT_CONDITION];
  };

  const getPatientSeed = (patientId) => {
    if (!patientId) return 0;
    return patientId.charCodeAt(patientId.length - 1);
  };

  const getOrInitState = (patientId, scenarios) => {
    if (!patientStates.has(patientId)) {
      patientStates.set(patientId, {
        currentHR: scenarios[0].targets.hr,
        currentSpo2: scenarios[0].targets.spo2,
        currentTemp: scenarios[0].targets.temp,
        scenarioIndex: 0,
        scenarioTimer: 0,
        worsenUntilMs: 0,
        worsenStartedAtMs: 0,
      });
    }
    return patientStates.get(patientId);
  };

  const isWorsenActive = (patientId) => {
    const state = patientStates.get(patientId);
    if (!state) return false;
    return Boolean(state.worsenUntilMs && Date.now() < state.worsenUntilMs);
  };

  const activateWorsen = (patientId, durationMs = WORSEN_DEFAULT_DURATION_MS, condition) => {
    const now = Date.now();
    const state = ensureState(patientId, condition);

    if (!state.worsenStartedAtMs || now >= state.worsenUntilMs) {
      state.worsenStartedAtMs = now;
    }

    const nextUntil = now + Math.max(0, Number(durationMs) || 0);
    state.worsenUntilMs = Math.max(state.worsenUntilMs || 0, nextUntil);
  };

  const stopWorsen = (patientId) => {
    const state = patientStates.get(patientId);
    if (!state) return;
    state.worsenUntilMs = 0;
    state.worsenStartedAtMs = 0;
  };

  const generate = (patient) => {
    const condition = patient?.condition || DEFAULT_CONDITION;
    const scenarios = getScenariosFor(condition);
    const patientId = patient?.id || patient?.patientId || 'unknown';
    const patientSeed = getPatientSeed(patientId);

    const state = getOrInitState(patientId, scenarios);
    const currentScenario = scenarios[state.scenarioIndex];

    const now = Date.now();
    const worsenActive = Boolean(state.worsenUntilMs && now < state.worsenUntilMs);

    // Update scenario timer
    state.scenarioTimer++;

    // Check if need to switch scenario (80% stay stable, 20% change)
    if (state.scenarioTimer >= currentScenario.duration) {
      state.scenarioTimer = 0;
      if (Math.random() < 0.8) {
        // Stay in stable or recovery
        state.scenarioIndex = Math.random() < 0.7 ? 0 : scenarios.length - 1;
      } else {
        // Move to next scenario in sequence
        state.scenarioIndex = (state.scenarioIndex + 1) % scenarios.length;
      }
    }

    const scenario = scenarios[state.scenarioIndex];

    const baseTargets = scenario.targets;
    const worsenTargets = worsenActive
      ? {
        hr: clamp(baseTargets.hr + 42, 55, 155),
        spo2: clamp(baseTargets.spo2 - 7.5, 85, 100),
        temp: clamp(baseTargets.temp + 1.2, 35.5, 40.0),
      }
      : baseTargets;

    // Smooth interpolation; accelerate when worsen-mode is active for immediate effect
    const hrSpeed = worsenActive ? 0.085 : 0.03;
    const spo2Speed = worsenActive ? 0.06 : 0.02;
    const tempSpeed = worsenActive ? 0.04 : 0.01;

    state.currentHR = lerp(state.currentHR, worsenTargets.hr, hrSpeed);
    state.currentSpo2 = lerp(state.currentSpo2, worsenTargets.spo2, spo2Speed);
    state.currentTemp = lerp(state.currentTemp, worsenTargets.temp, tempSpeed);

    // Add subtle natural variability
    const variabilityBoost = worsenActive ? 1.6 : 1;
    const heartRate = clampInt(
      addNaturalVariability(state.currentHR, scenario.variability.hr * variabilityBoost, patientSeed),
      50,
      170
    );

    const spo2 = clampInt(
      addNaturalVariability(state.currentSpo2, scenario.variability.spo2 * variabilityBoost, patientSeed + 10),
      82,
      100
    );

    const temperature =
      Math.round(
        clamp(addNaturalVariability(state.currentTemp, scenario.variability.temp * variabilityBoost, patientSeed + 20), 35.5, 40.0) * 10
      ) / 10;

    // Determine status based on vitals
    let status = 'normal';
    const alerts = [];

    if (heartRate > 120 || spo2 < 90 || temperature > 38.5) {
      status = 'critical';
      if (heartRate > 120) alerts.push('Tachycardia');
      if (spo2 < 90) alerts.push('Hypoxemia');
      if (temperature > 38.5) alerts.push('High Fever');
    } else if (heartRate > 100 || spo2 < 94 || temperature > 37.8) {
      status = 'warning';
      if (heartRate > 100) alerts.push('Elevated HR');
      if (spo2 < 94) alerts.push('Low SpO2');
      if (temperature > 37.8) alerts.push('Fever');
    }

    return {
      patientId: patient?.id,
      patientName: patient?.name,
      patientAge: patient?.age,
      patientGender: patient?.gender,
      ambulance: patient?.ambulance,
      location: patient?.location,
      condition: patient?.condition,
      scenario: scenario.name,
      worsenActive,
      vitals: {
        heartRate,
        spo2,
        temperature,
      },
      status,
      alerts,
      timestamp: new Date().toISOString(),
    };
  };

  return {
    generate,
    isWorsenActive,
    activateWorsen,
    stopWorsen,
  };
}
