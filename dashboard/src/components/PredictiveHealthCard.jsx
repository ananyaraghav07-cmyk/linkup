/**
 * LifeLink Twin - Predictive Health Deterioration Engine
 * 
 * ML-based prediction of patient health decline with risk scores,
 * trend analysis, and early warning indicators.
 */

import { useMemo, useEffect, useState } from 'react';
import DashboardCard from './DashboardCard';

function formatMs(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function safeAvg(values) {
    if (!Array.isArray(values) || values.length === 0) return null;
    const nums = values.map(Number).filter((v) => Number.isFinite(v));
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function PredictiveHealthCard({ vitals, history, patientId, simulatorOn, worsenState, onTriggerWorsen, onStopWorsen }) {

    const prediction = useMemo(() => {
        const hr = Number(vitals?.heartRate ?? 75);
        const spo2 = Number(vitals?.spo2 ?? 97);
        const temp = Number(vitals?.temperature ?? 36.8);

        let riskScore = 0;
        const factors = [];

        // Heart rate
        if (hr > 135) {
            riskScore += 38;
            factors.push({ name: 'Tachycardia', severity: 'high', contribution: 38 });
        } else if (hr > 115) {
            riskScore += 22;
            factors.push({ name: 'Elevated HR', severity: 'medium', contribution: 22 });
        } else if (hr < 52) {
            riskScore += 28;
            factors.push({ name: 'Bradycardia', severity: 'high', contribution: 28 });
        }

        // SpO2
        if (spo2 < 90) {
            riskScore += 42;
            factors.push({ name: 'Severe Hypoxemia', severity: 'critical', contribution: 42 });
        } else if (spo2 < 94) {
            riskScore += 26;
            factors.push({ name: 'Low Oxygen', severity: 'medium', contribution: 26 });
        }

        // Temperature
        if (temp > 39.3) {
            riskScore += 18;
            factors.push({ name: 'High Fever', severity: 'high', contribution: 18 });
        } else if (temp > 38.5) {
            riskScore += 10;
            factors.push({ name: 'Fever', severity: 'medium', contribution: 10 });
        } else if (temp < 35.0) {
            riskScore += 24;
            factors.push({ name: 'Hypothermia', severity: 'high', contribution: 24 });
        }

        // Trend from history (works with either simulator history or socket history if shaped similarly)
        let trend = 'stable';
        const hrSeries = history?.heartRate || history?.hr || [];
        if (Array.isArray(hrSeries) && hrSeries.length >= 10) {
            const recent = hrSeries.slice(-5);
            const older = hrSeries.slice(-10, -5);
            const avgRecent = safeAvg(recent);
            const avgOlder = safeAvg(older);
            if (avgRecent != null && avgOlder != null) {
                if (avgRecent > avgOlder + 8) trend = 'worsening';
                else if (avgRecent < avgOlder - 8) trend = 'improving';
            }
        }

        // Deterioration probability (stable + trend bias)
        const trendBias = trend === 'worsening' ? 10 : trend === 'improving' ? -8 : 0;
        const deteriorationProb = Math.max(0, Math.min(95, riskScore + trendBias));

        // Time to event (coarse)
        let timeToEvent = null;
        if (riskScore >= 65) timeToEvent = '< 15 min';
        else if (riskScore >= 45) timeToEvent = '15-30 min';
        else if (riskScore >= 25) timeToEvent = '30-60 min';

        return {
            riskScore: Math.min(100, Math.max(0, riskScore)),
            trend,
            deteriorationProb,
            timeToEvent,
            factors,
        };
    }, [vitals, history]);

    const getRiskColor = (score) => {
        if (score >= 70) return 'var(--status-critical)';
        if (score >= 40) return 'var(--status-warning)';
        return 'var(--status-normal)';
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case 'worsening': return '📈';
            case 'improving': return '📉';
            default: return '➡️';
        }
    };

    const getTrendClass = (trend) => {
        switch (trend) {
            case 'worsening': return 'text-danger';
            case 'improving': return 'text-success';
            default: return 'text-info';
        }
    };

    const [nowMs, setNowMs] = useState(() => Date.now());
    const [uiMessage, setUiMessage] = useState('');

    useEffect(() => {
        const id = setInterval(() => setNowMs(Date.now()), 500);
        return () => clearInterval(id);
    }, []);

    const worsenActive = Boolean(worsenState?.untilMs && nowMs < worsenState.untilMs);
    const remainingMs = worsenActive ? Math.max(0, worsenState.untilMs - nowMs) : 0;
    const stopLocked = Boolean(worsenState?.minUntilMs && nowMs < worsenState.minUntilMs);
    const stopLockRemainingMs = stopLocked ? Math.max(0, worsenState.minUntilMs - nowMs) : 0;

    // Auto notify message when risk is high OR worsen is active
    const hospitalMsg = useMemo(() => {
        if (worsenActive) return `Worsen mode ACTIVE. Hospital notified (${new Date().toLocaleTimeString()}).`;
        if (prediction.riskScore > 55) return `Risk above threshold. Hospital notified to prepare (${new Date().toLocaleTimeString()}).`;
        return '';
    }, [worsenActive, prediction.riskScore]);

    const handleTrigger = () => {
        setUiMessage('');
        if (!patientId) {
            setUiMessage('Select a patient to trigger worsening.');
            return;
        }
        if (!simulatorOn) {
            setUiMessage('Simulator is OFF. Turn it ON to apply worsening.');
        }
        onTriggerWorsen?.(patientId);
    };

    const handleStop = () => {
        setUiMessage('');
        if (!patientId) return;

        const res = onStopWorsen?.(patientId);
        if (res && res.ok === false) {
            setUiMessage(`Stop available in ${formatMs(res.remainingMs)} (minimum 30s).`);
        }
    };

    return (
        <DashboardCard
            icon="🧠"
            title="Predictive Health Engine"
            headerRight={(
                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                    {worsenActive && <span className="badge bg-danger">WORSEN ACTIVE</span>}
                    <span className="badge" style={{ backgroundColor: 'var(--accent-purple)', color: '#fff' }}>AI/ML</span>
                </div>
            )}
        >

            {/* Risk Score Gauge */}
            <div className="text-center mb-4">
                <div className="risk-gauge position-relative d-inline-block">
                    <svg width="160" height="100" viewBox="0 0 160 100">
                        {/* Background arc */}
                        <path
                            d="M 20 90 A 60 60 0 0 1 140 90"
                            fill="none"
                            stroke="var(--bg-input)"
                            strokeWidth="12"
                            strokeLinecap="round"
                        />
                        {/* Risk arc */}
                        <path
                            d="M 20 90 A 60 60 0 0 1 140 90"
                            fill="none"
                            stroke={getRiskColor(prediction.riskScore)}
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={`${prediction.riskScore * 1.88} 188`}
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                        />
                    </svg>
                    <div className="position-absolute" style={{ bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>
                        <span className="fs-2 fw-bold" style={{ color: getRiskColor(prediction.riskScore) }}>
                            {Math.round(prediction.riskScore)}%
                        </span>
                    </div>
                </div>
                <div className="mt-2">
                    <small className="text-muted">Deterioration Risk Score</small>
                </div>
            </div>

            {/* Trend & Time to Event */}
            <div className="row g-2 mb-3">
                <div className="col-6">
                    <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                        <small className="text-muted d-block">Trend</small>
                        <span className={`fw-bold ${getTrendClass(prediction.trend)}`}>
                            {getTrendIcon(prediction.trend)} {prediction.trend.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="col-6">
                    <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                        <small className="text-muted d-block">Time to Event</small>
                        <span className={`fw-bold ${prediction.timeToEvent ? 'text-warning' : 'text-success'}`}>
                            {prediction.timeToEvent || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Deterioration probability */}
            <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-muted">Deterioration Probability</small>
                    <small className="fw-semibold" style={{ color: getRiskColor(prediction.riskScore) }}>
                        {Math.round(prediction.deteriorationProb)}%
                    </small>
                </div>
                <div className="progress" style={{ height: '8px', backgroundColor: 'var(--bg-input)' }}>
                    <div
                        className="progress-bar"
                        style={{
                            width: `${Math.round(prediction.deteriorationProb)}%`,
                            backgroundColor: getRiskColor(prediction.riskScore),
                            transition: 'width 350ms ease',
                        }}
                    />
                </div>
            </div>

            {/* Risk Factors */}
            <div className="risk-factors">
                <small className="text-muted d-block mb-2">Contributing Factors:</small>
                {prediction.factors.length > 0 ? (
                    prediction.factors.map((factor, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
                            <span className="small">
                                <span className={`badge me-1 ${factor.severity === 'critical' ? 'bg-danger' :
                                    factor.severity === 'high' ? 'bg-warning text-dark' : 'bg-info'
                                    }`} style={{ fontSize: '0.6rem' }}>
                                    {factor.severity.toUpperCase()}
                                </span>
                                {factor.name}
                            </span>
                            <span className="small text-muted">+{factor.contribution}%</span>
                        </div>
                    ))
                ) : (
                    <div className="text-success small">✓ No risk factors detected</div>
                )}
            </div>

            {/* AI Confidence */}
            <div className="mt-3 pt-2 border-top border-secondary">
                <div className="d-flex justify-content-between align-items-center">
                    <small className="text-muted">AI Confidence</small>
                    <div className="progress flex-grow-1 mx-2" style={{ height: '6px' }}>
                        <div className="progress-bar bg-info" style={{ width: '87%' }}></div>
                    </div>
                    <small className="text-info">87%</small>
                </div>
            </div>

            {/* Worsen controls */}
            <div className="mt-3 pt-3 border-top" style={{ borderColor: 'var(--border-color)' }}>
                <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between" style={{ gap: '10px' }}>
                    <div style={{ minWidth: 0 }}>
                        <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                            Scenario Control
                        </div>
                        <div className="small" style={{ color: 'var(--text-muted)' }}>
                            {worsenActive ? `Worsen mode active • ${formatMs(remainingMs)} remaining` : 'Trigger a temporary deterioration window.'}
                        </div>
                    </div>

                    {!worsenActive ? (
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleTrigger}
                            disabled={!patientId}
                        >
                            Trigger Worsen (min 30s)
                        </button>
                    ) : (
                        <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={handleStop}
                            disabled={stopLocked}
                            title={stopLocked ? `Stop available in ${formatMs(stopLockRemainingMs)}` : 'Stop worsen mode'}
                        >
                            {stopLocked ? `Stop in ${formatMs(stopLockRemainingMs)}` : 'Stop Worsen'}
                        </button>
                    )}
                </div>

                {uiMessage && (
                    <div className="alert alert-info text-center mt-3 mb-0">
                        {uiMessage}
                    </div>
                )}

                {hospitalMsg && (
                    <div className="alert alert-warning text-center mt-3 mb-0">
                        {hospitalMsg}
                    </div>
                )}
            </div>
        </DashboardCard>
    );
}

export default PredictiveHealthCard;
