# Intelligent Monitoring Modules (Backend)

These files implement **read-only** intelligent monitoring features:

- Multi-vital verification (avoid single-vital false alerts)
- Duration-based spike filtering (30–60s buffers)
- Rolling trend analyzer (moving slope / stability)
- Personalized baseline validation (additional layer)
- Risk score engine (0–100)
- Alert confidence engine (0–100)
- Cooldown mechanism (re-check suggestion)
- Stability index (0–100)
- Human-readable insights

All logic is contained in `server/modules/*` and can be plugged into the existing flow via a wrapper.

## Main entry

- `analyzeVitalsPacket(packet, opts)` in `monitoringPipeline.js`

### Expected packet shape

```js
{
  patientId: 'patient1',
  timestamp: Date.now(),
  vitals: { heartRate: 80, spo2: 98, temperature: 36.7 },
}
```

### Expected buffers

Caller supplies recent window points (e.g. last 60s):

```js
{
  hrPoints:   [{ t, v }...],
  spo2Points: [{ t, v }...],
  tempPoints: [{ t, v }...],
}
```

## Example (wrapper style)

```js
const { analyzeVitalsPacket } = require('./modules/monitoringPipeline');

const analysis = analyzeVitalsPacket(data, {
  buffers: {
    hrPoints: history.heartRate.map((v, i) => ({ t: Date.now() - (history.heartRate.length - 1 - i) * 1000, v })),
    spo2Points: history.spo2.map((v, i) => ({ t: Date.now() - (history.spo2.length - 1 - i) * 1000, v })),
    tempPoints: history.temperature.map((v, i) => ({ t: Date.now() - (history.temperature.length - 1 - i) * 1000, v })),
  },
  persistMs: 30_000,
  cooldownMs: 60_000,
  baseline: DEFAULT_BASELINE,
});

// analysis.risk.score, analysis.confidence.action, analysis.insights...
```

Integration note: emitting these fields to the dashboard would require adding them to an existing payload or a new event. That wiring should be a minimal 1–2 line wrapper change (no refactor).
