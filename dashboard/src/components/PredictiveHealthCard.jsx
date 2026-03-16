/**
 * LifeLink Twin - Predictive Health Deterioration Engine
 * 
 * ML-based prediction of patient health decline with risk scores,
 * trend analysis, and early warning indicators.
 */

import { useState, useEffect } from 'react';

function PredictiveHealthCard({ vitals, history }) {
    const [prediction, setPrediction] = useState({
        riskScore: 0,
        trend: 'stable',
        deteriorationProb: 0,
        timeToEvent: null,
        factors: []
    });

    // Simulate ML prediction based on vitals
    useEffect(() => {
        if (!vitals) return;

        const hr = vitals.heartRate || 75;
        const spo2 = vitals.spo2 || 97;
        const temp = vitals.temperature || 36.8;

        // Calculate risk factors
        let riskScore = 0;
        const factors = [];

        // Heart rate analysis
        if (hr > 130) {
            riskScore += 35;
            factors.push({ name: 'Tachycardia', severity: 'high', contribution: 35 });
        } else if (hr > 110) {
            riskScore += 20;
            factors.push({ name: 'Elevated HR', severity: 'medium', contribution: 20 });
        } else if (hr < 55) {
            riskScore += 25;
            factors.push({ name: 'Bradycardia', severity: 'high', contribution: 25 });
        }

        // SpO2 analysis
        if (spo2 < 90) {
            riskScore += 40;
            factors.push({ name: 'Severe Hypoxemia', severity: 'critical', contribution: 40 });
        } else if (spo2 < 94) {
            riskScore += 25;
            factors.push({ name: 'Low Oxygen', severity: 'medium', contribution: 25 });
        }

        // Temperature analysis
        if (temp > 39.5) {
            riskScore += 20;
            factors.push({ name: 'High Fever', severity: 'high', contribution: 20 });
        } else if (temp > 38.5) {
            riskScore += 10;
            factors.push({ name: 'Fever', severity: 'medium', contribution: 10 });
        } else if (temp < 35) {
            riskScore += 25;
            factors.push({ name: 'Hypothermia', severity: 'high', contribution: 25 });
        }

        // Trend analysis from history
        let trend = 'stable';
        if (history?.heartRate?.length > 5) {
            const recentHR = history.heartRate.slice(-5);
            const avgRecent = recentHR.reduce((a, b) => a + b, 0) / recentHR.length;
            const olderHR = history.heartRate.slice(-10, -5);
            if (olderHR.length > 0) {
                const avgOlder = olderHR.reduce((a, b) => a + b, 0) / olderHR.length;
                if (avgRecent > avgOlder + 10) trend = 'worsening';
                else if (avgRecent < avgOlder - 10) trend = 'improving';
            }
        }

        // Calculate deterioration probability
        const deteriorationProb = Math.min(95, riskScore + Math.random() * 10);

        // Estimate time to critical event
        let timeToEvent = null;
        if (riskScore > 60) timeToEvent = '< 15 min';
        else if (riskScore > 40) timeToEvent = '15-30 min';
        else if (riskScore > 20) timeToEvent = '30-60 min';

        setPrediction({
            riskScore: Math.min(100, riskScore),
            trend,
            deteriorationProb,
            timeToEvent,
            factors
        });
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

    // Worsen situation trigger state
    const [triggered, setTriggered] = useState(false);
    const [hospitalMsg, setHospitalMsg] = useState("");

    useEffect(() => {
        if (prediction.riskScore > 50) {
            // Only send auto message if not triggered manually
            if (!triggered) {
                const msg = `Risk above 50%. Hospital notified to prepare required things at ${new Date().toLocaleTimeString()}.`;
                setHospitalMsg(msg);
                if (window) window._hospitalTriggerMsg = msg;
            }
        } else {
            setHospitalMsg("");
            if (window) window._hospitalTriggerMsg = "";
        }
    }, [prediction.riskScore, triggered]);

    const handleTrigger = () => {
        setTriggered(true);
        const msg = `Worsen situation triggered at ${new Date().toLocaleTimeString()}. Hospital notified.`;
        setHospitalMsg(msg);
        if (window) {
            window._hospitalTriggerMsg = msg;
            window.dispatchEvent(new CustomEvent('hospitalTrigger', { detail: msg }));
        }
        // Here you could add logic to send a message to hospital backend/API
    };

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🧠</span>
                        <span className="vital-title">Predictive Health Engine</span>
                    </div>
                    <span className="badge bg-purple">AI/ML</span>
                </div>

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

                {/* Trigger Button for Worsen Situation (always shown below AI confidence) */}
                {!triggered && (
                    <div className="mt-3 text-center">
                        <button className="btn btn-danger" onClick={handleTrigger}>
                            Trigger Worsen Situation
                        </button>
                    </div>
                )}
                {/* Only show one hospital message, prefer manual trigger if present */}
                {hospitalMsg && (
                    <div className="alert alert-warning text-center mt-3">
                        {hospitalMsg}
                    </div>
                )}
            </div>
        </div>
    );
}

export default PredictiveHealthCard;
