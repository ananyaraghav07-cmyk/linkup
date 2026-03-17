# Dashboard Intelligence Modules

These are **add-on** (read-only) analysis utilities intended to be imported by React components.

- `insightsEngine.js`: computes risk score, alert confidence, trend flags, spike filtering, baseline deviation, stability index, and insights.
- `scenarioModes.js`: pure scenario wrapper (no simulator changes by itself).

Integration requires rendering the new cards and passing `analysis`.
