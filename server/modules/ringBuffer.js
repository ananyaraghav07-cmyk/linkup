'use strict';

/**
 * Time-based ring buffer for vital readings.
 * Stores { t: number(ms), v: number } points.
 */

function clampNumber(value, fallback = 0) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

class TimeSeriesBuffer {
    constructor({ maxAgeMs = 60_000, maxPoints = 240 } = {}) {
        this.maxAgeMs = clampNumber(maxAgeMs, 60_000);
        this.maxPoints = clampNumber(maxPoints, 240);
        this.points = [];
    }

    push(t, v) {
        const time = clampNumber(t, Date.now());
        const value = clampNumber(v, NaN);
        if (!Number.isFinite(value)) return;

        this.points.push({ t: time, v: value });
        this.prune(time);
    }

    prune(nowMs = Date.now()) {
        const now = clampNumber(nowMs, Date.now());
        const cutoff = now - this.maxAgeMs;

        while (this.points.length > 0 && this.points[0].t < cutoff) {
            this.points.shift();
        }
        while (this.points.length > this.maxPoints) {
            this.points.shift();
        }
    }

    values() {
        return this.points.map((p) => p.v);
    }

    window(ms, nowMs = Date.now()) {
        const now = clampNumber(nowMs, Date.now());
        const span = clampNumber(ms, this.maxAgeMs);
        const cutoff = now - span;
        return this.points.filter((p) => p.t >= cutoff && p.t <= now);
    }

    last() {
        return this.points.length ? this.points[this.points.length - 1] : null;
    }

    size() {
        return this.points.length;
    }
}

module.exports = {
    TimeSeriesBuffer,
    clampNumber,
};
