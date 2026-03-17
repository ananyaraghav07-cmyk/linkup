/**
 * LifeLink Twin - Emergency Escalation Logic Panel
 * 
 * Automated emergency escalation system that:
 * - Monitors vital thresholds and triggers appropriate responses
 * - Escalates through notification tiers (Doctor → Specialist → Code Team)
 * - Tracks escalation timeline and response status
 * - Provides protocol guidance based on condition
 */

import { useState, useEffect, useCallback } from 'react';

function EmergencyEscalationCard({ patientData, vitals }) {
    const [escalationState, setEscalationState] = useState({
        level: 0, // 0=Normal, 1=Alert, 2=Warning, 3=Critical, 4=Emergency
        status: 'monitoring',
        activeAlerts: [],
        notificationsSent: [],
        timeline: [],
        protocol: null,
        countdown: null
    });

    const [isAcknowledged, setIsAcknowledged] = useState(false);
    const [selectedProtocol, setSelectedProtocol] = useState(null);

    // Escalation levels configuration
    const escalationLevels = [
        { level: 0, name: 'Normal', color: '#10b981', icon: '✅', responders: [] },
        { level: 1, name: 'Alert', color: '#3b82f6', icon: '📢', responders: ['On-call Doctor'] },
        { level: 2, name: 'Warning', color: '#f59e0b', icon: '⚠️', responders: ['Senior Doctor', 'On-call Physician'] },
        { level: 3, name: 'Critical', color: '#ef4444', icon: '🚨', responders: ['Attending Physician', 'ICU Team', 'Specialist On-call'] },
        { level: 4, name: 'Emergency', color: '#dc2626', icon: '🆘', responders: ['Code Blue Team', 'Anesthesiologist', 'All Available Staff'] }
    ];

    // Emergency protocols
    const protocols = {
        cardiac: {
            name: 'Cardiac Emergency Protocol',
            icon: '❤️',
            steps: [
                'Activate cardiac monitoring',
                'Prepare defibrillator',
                'Administer Aspirin 325mg if not contraindicated',
                'Establish IV access',
                'Prepare for 12-lead ECG',
                'Notify cardiology on-call'
            ],
            medications: ['Aspirin', 'Nitroglycerin', 'Heparin', 'Morphine']
        },
        respiratory: {
            name: 'Respiratory Distress Protocol',
            icon: '🫁',
            steps: [
                'Administer high-flow oxygen',
                'Position patient upright',
                'Prepare for intubation if needed',
                'Order ABG and chest X-ray',
                'Prepare bronchodilators',
                'Alert respiratory therapy'
            ],
            medications: ['Albuterol', 'Ipratropium', 'Methylprednisolone']
        },
        hypotension: {
            name: 'Hypotension Protocol',
            icon: '💉',
            steps: [
                'Initiate fluid resuscitation',
                'Place patient in Trendelenburg',
                'Check for hemorrhage',
                'Prepare vasopressors',
                'Order type and screen',
                'Monitor urine output'
            ],
            medications: ['Normal Saline', 'Norepinephrine', 'Vasopressin']
        },
        sepsis: {
            name: 'Sepsis Bundle Protocol',
            icon: '🦠',
            steps: [
                'Draw blood cultures x2',
                'Initiate broad-spectrum antibiotics within 1 hour',
                '30ml/kg crystalloid bolus',
                'Measure lactate levels',
                'Monitor MAP ≥65 mmHg',
                'Reassess fluid responsiveness'
            ],
            medications: ['Piperacillin-Tazobactam', 'Vancomycin', 'Norepinephrine']
        }
    };

    // Calculate escalation level based on vitals
    const calculateEscalationLevel = useCallback((vitals, status) => {
        if (!vitals) return 0;

        const hr = vitals.heartRate || 75;
        const spo2 = vitals.spo2 || 97;
        const temp = vitals.temperature || 36.8;

        let level = 0;
        const alerts = [];

        // Critical thresholds - Level 4 (Emergency)
        if (hr > 150 || hr < 40 || spo2 < 85) {
            level = 4;
            if (hr > 150) alerts.push({ type: 'Severe Tachycardia', value: `${hr} BPM`, severity: 'emergency' });
            if (hr < 40) alerts.push({ type: 'Severe Bradycardia', value: `${hr} BPM`, severity: 'emergency' });
            if (spo2 < 85) alerts.push({ type: 'Severe Hypoxia', value: `${spo2}%`, severity: 'emergency' });
        }
        // Critical thresholds - Level 3
        else if (hr > 130 || hr < 50 || spo2 < 90 || temp > 40) {
            level = 3;
            if (hr > 130) alerts.push({ type: 'Tachycardia', value: `${hr} BPM`, severity: 'critical' });
            if (hr < 50) alerts.push({ type: 'Bradycardia', value: `${hr} BPM`, severity: 'critical' });
            if (spo2 < 90) alerts.push({ type: 'Hypoxemia', value: `${spo2}%`, severity: 'critical' });
            if (temp > 40) alerts.push({ type: 'Hyperthermia', value: `${temp}°C`, severity: 'critical' });
        }
        // Warning thresholds - Level 2
        else if (hr > 110 || hr < 55 || spo2 < 94 || temp > 39) {
            level = 2;
            if (hr > 110) alerts.push({ type: 'Elevated HR', value: `${hr} BPM`, severity: 'warning' });
            if (hr < 55) alerts.push({ type: 'Low HR', value: `${hr} BPM`, severity: 'warning' });
            if (spo2 < 94) alerts.push({ type: 'Low SpO2', value: `${spo2}%`, severity: 'warning' });
            if (temp > 39) alerts.push({ type: 'Fever', value: `${temp}°C`, severity: 'warning' });
        }
        // Alert thresholds - Level 1
        else if (hr > 100 || hr < 60 || spo2 < 96 || temp > 38) {
            level = 1;
            if (hr > 100) alerts.push({ type: 'Mild Tachycardia', value: `${hr} BPM`, severity: 'alert' });
            if (spo2 < 96) alerts.push({ type: 'Borderline SpO2', value: `${spo2}%`, severity: 'alert' });
            if (temp > 38) alerts.push({ type: 'Low-grade Fever', value: `${temp}°C`, severity: 'alert' });
        }

        // Override with status if critical
        if (status === 'critical' && level < 3) level = 3;

        return { level, alerts };
    }, []);

    // Determine appropriate protocol
    const determineProtocol = useCallback((alerts, vitals) => {
        if (!alerts.length) return null;

        const hr = vitals?.heartRate || 75;
        const spo2 = vitals?.spo2 || 97;

        // Priority-based protocol selection
        if (alerts.some(a => a.type.includes('Tachycardia') || a.type.includes('Bradycardia'))) {
            return 'cardiac';
        }
        if (alerts.some(a => a.type.includes('Hypox') || a.type.includes('SpO2'))) {
            return 'respiratory';
        }
        if (hr > 110 && vitals?.temperature > 38) {
            return 'sepsis';
        }
        return null;
    }, []);

    // Main escalation effect
    useEffect(() => {
        const status = patientData?.status || 'normal';
        const { level, alerts } = calculateEscalationLevel(vitals, status);
        const protocolKey = determineProtocol(alerts, vitals);

        setEscalationState(prev => {
            // Check if level changed
            const levelChanged = prev.level !== level;

            // Create new notification if escalating
            const newNotifications = levelChanged && level > prev.level
                ? [...prev.notificationsSent, {
                    level,
                    responders: escalationLevels[level].responders,
                    time: new Date().toLocaleTimeString(),
                    status: 'sent'
                }]
                : prev.notificationsSent;

            // Add to timeline if level changed
            const newTimeline = levelChanged
                ? [...prev.timeline.slice(-9), {
                    time: new Date().toLocaleTimeString(),
                    event: `Escalation ${level > prev.level ? 'raised' : 'lowered'} to Level ${level}`,
                    level,
                    direction: level > prev.level ? 'up' : 'down'
                }]
                : prev.timeline;

            return {
                ...prev,
                level,
                status: level === 0 ? 'monitoring' : level >= 3 ? 'emergency' : 'escalated',
                activeAlerts: alerts,
                notificationsSent: newNotifications,
                timeline: newTimeline,
                protocol: protocolKey ? protocols[protocolKey] : null,
                countdown: level >= 3 ? 300 : null // 5 min response countdown for critical
            };
        });

        if (protocolKey) {
            setSelectedProtocol(protocolKey);
        }
    }, [vitals, patientData, calculateEscalationLevel, determineProtocol]);

    // Countdown timer for critical situations
    useEffect(() => {
        if (escalationState.countdown === null || escalationState.countdown <= 0) return;

        const timer = setInterval(() => {
            setEscalationState(prev => ({
                ...prev,
                countdown: prev.countdown > 0 ? prev.countdown - 1 : null
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, [escalationState.countdown]);

    const handleAcknowledge = () => {
        setIsAcknowledged(true);
        setEscalationState(prev => ({
            ...prev,
            timeline: [...prev.timeline, {
                time: new Date().toLocaleTimeString(),
                event: 'Alert acknowledged by staff',
                level: prev.level,
                direction: 'ack'
            }]
        }));
    };

    const currentLevel = escalationLevels[escalationState.level];
    const formatCountdown = (seconds) => {
        if (!seconds) return '--:--';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="card vital-card" style={{
            borderColor: escalationState.level >= 3 ? currentLevel.color : undefined,
            borderWidth: escalationState.level >= 3 ? '2px' : undefined
        }}>
            <div className="card-body">
                {/* Header with Level Indicator */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🚨</span>
                        <span className="vital-title">Emergency Escalation</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span
                            className="badge"
                            style={{ backgroundColor: currentLevel.color, fontSize: '0.9rem' }}
                        >
                            {currentLevel.icon} Level {escalationState.level}
                        </span>
                    </div>
                </div>

                {/* Current Status Banner */}
                <div
                    className="status-banner p-3 rounded mb-3 text-center"
                    style={{ backgroundColor: currentLevel.color, opacity: 0.9 }}
                >
                    <div style={{ fontSize: '1.5rem' }}>{currentLevel.icon}</div>
                    <strong className="text-white">{currentLevel.name.toUpperCase()}</strong>
                    {escalationState.countdown && (
                        <div className="mt-2">
                            <small className="text-white">Response Required In:</small>
                            <div className="countdown-timer" style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>
                                {formatCountdown(escalationState.countdown)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Active Alerts */}
                {escalationState.activeAlerts.length > 0 && (
                    <div className="active-alerts mb-3">
                        <small className="text-muted d-block mb-2">Active Alerts:</small>
                        <div className="d-flex flex-wrap gap-2">
                            {escalationState.activeAlerts.map((alert, idx) => (
                                <span
                                    key={idx}
                                    className="badge"
                                    style={{
                                        backgroundColor: alert.severity === 'emergency' ? '#dc2626' :
                                            alert.severity === 'critical' ? '#ef4444' :
                                                alert.severity === 'warning' ? '#f59e0b' : '#3b82f6'
                                    }}
                                >
                                    {alert.type}: {alert.value}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Responders Notified */}
                {escalationState.level > 0 && (
                    <div className="responders-section mb-3 p-2 bg-dark rounded">
                        <small className="text-muted d-block mb-2">Responders Notified:</small>
                        {currentLevel.responders.map((responder, idx) => (
                            <div key={idx} className="d-flex justify-content-between align-items-center mb-1">
                                <span className="small">👤 {responder}</span>
                                <span className="badge bg-info">Notified</span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Active Protocol */}
                {escalationState.protocol && (
                    <div className="protocol-section mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <small className="text-muted">Active Protocol:</small>
                            <span className="badge bg-danger">
                                {escalationState.protocol.icon} {escalationState.protocol.name}
                            </span>
                        </div>
                        <div className="protocol-steps p-2 bg-dark rounded">
                            <ol className="mb-0 ps-3" style={{ fontSize: '0.8rem' }}>
                                {escalationState.protocol.steps.slice(0, 4).map((step, idx) => (
                                    <li key={idx} className="mb-1">{step}</li>
                                ))}
                            </ol>
                            {escalationState.protocol.steps.length > 4 && (
                                <small className="text-muted">
                                    +{escalationState.protocol.steps.length - 4} more steps
                                </small>
                            )}
                        </div>
                    </div>
                )}

                {/* Escalation Timeline */}
                {escalationState.timeline.length > 0 && (
                    <div className="timeline-section mb-3">
                        <small className="text-muted d-block mb-2">Escalation Timeline:</small>
                        <div className="timeline-list" style={{ maxHeight: '120px', overflowY: 'auto' }}>
                            {escalationState.timeline.slice(-5).reverse().map((item, idx) => (
                                <div key={idx} className="d-flex align-items-center mb-1">
                                    <small className="text-muted me-2" style={{ width: '60px' }}>
                                        {item.time}
                                    </small>
                                    <span className="me-2">
                                        {item.direction === 'up' ? '⬆️' : item.direction === 'down' ? '⬇️' : '✅'}
                                    </span>
                                    <small>{item.event}</small>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                {escalationState.level >= 2 && !isAcknowledged && (
                    <button
                        className="btn btn-warning w-100"
                        onClick={handleAcknowledge}
                    >
                        ✋ Acknowledge Alert
                    </button>
                )}

                {isAcknowledged && (
                    <div className="text-center text-success">
                        <small>✅ Alert acknowledged - Response team en route</small>
                    </div>
                )}

                {/* Level Indicator Bar */}
                <div className="level-indicator mt-3">
                    <div className="d-flex justify-content-between mb-1">
                        {escalationLevels.map((lvl, idx) => (
                            <div
                                key={idx}
                                className="level-dot"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: idx <= escalationState.level ? lvl.color : '#2d3748',
                                    border: idx === escalationState.level ? '2px solid white' : 'none',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.6rem'
                                }}
                            >
                                {idx <= escalationState.level ? lvl.icon : ''}
                            </div>
                        ))}
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                        <div
                            className="progress-bar"
                            style={{
                                width: `${(escalationState.level / 4) * 100}%`,
                                backgroundColor: currentLevel.color
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmergencyEscalationCard;
