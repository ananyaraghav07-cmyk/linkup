'use strict';

/**
 * Cooldown Mechanism
 * Suggests a delay/re-check before raising an alert.
 *
 * This module is designed to be used by a wrapper that can keep state (per patient).
 * It does NOT mutate existing vitals flow.
 */

function shouldStartCooldown({ eventClassification, confidenceAction }, { cooldownMs = 60_000 } = {}) {
    if (eventClassification === 'temporary_stress_event') {
        return { start: true, cooldownMs, reason: 'Single-vital spike - verify after cooldown' };
    }

    if (confidenceAction === 'warning') {
        return { start: true, cooldownMs, reason: 'Medium confidence - re-check after cooldown' };
    }

    return { start: false, cooldownMs, reason: null };
}

/**
 * Stateless helper for gate decision.
 * cooldownState: { activeUntilMs?: number }
 */
function gateWithCooldown(nowMs, cooldownState, proposedAction) {
    const now = Number(nowMs) || Date.now();
    const activeUntil = cooldownState && Number(cooldownState.activeUntilMs);

    if (Number.isFinite(activeUntil) && now < activeUntil) {
        return { action: 'hold', holdUntilMs: activeUntil, proposedAction };
    }
    return { action: proposedAction, holdUntilMs: null, proposedAction };
}

module.exports = {
    shouldStartCooldown,
    gateWithCooldown,
};
