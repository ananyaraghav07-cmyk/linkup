# Frontend Modules (Read-only)

These modules are **add-on intelligence** utilities. They do not change existing vitals flow; they only analyze existing readings.

- `analytics.js`: math helpers (mean/stddev/slope/stability)
- `insightsEngine.js`: risk score + alert confidence + insights (pure)
- `scenarioModes.js`: *wrapper-only* scenario transformation for demo modes

## Example usage

```html
<script type="module">
  import { analyzeVitals } from '/modules/insightsEngine.js';

  // Example: buffers must be built by your existing vitals flow
  const analysis = analyzeVitals({
    vitals: { heartRate: 130, spo2: 97, temperature: 36.8 },
    buffers: {
      hrPoints: [{ t: Date.now() - 5000, v: 90 }, { t: Date.now(), v: 130 }],
      spo2Points: [{ t: Date.now() - 5000, v: 97 }, { t: Date.now(), v: 97 }],
      tempPoints: [{ t: Date.now() - 5000, v: 36.8 }, { t: Date.now(), v: 36.8 }],
    },
  });

  console.log(analysis.risk, analysis.confidence, analysis.insights);
</script>
```
