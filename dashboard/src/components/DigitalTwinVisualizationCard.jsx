/**
 * LifeLink Twin - Medical Digital Twin Visualization
 * 
 * Interactive 3D-style visualization of the patient's digital twin showing:
 * - Anatomical body model with vital sign overlays
 * - Organ-specific health indicators
 * - Real-time physiological data mapping
 * - Predictive health zones
 */

import { useState, useEffect } from 'react';

function DigitalTwinVisualizationCard({ vitals, patientData }) {
    const [selectedOrgan, setSelectedOrgan] = useState(null);
    const [animationPhase, setAnimationPhase] = useState(0);
    const [viewMode, setViewMode] = useState('full'); // full, cardiac, respiratory, neural

    // Organ systems with health status
    const [organSystems, setOrganSystems] = useState({
        heart: { name: 'Heart', health: 100, status: 'normal', icon: '❤️', position: { x: 52, y: 28 } },
        lungs: { name: 'Lungs', health: 100, status: 'normal', icon: '🫁', position: { x: 50, y: 32 } },
        brain: { name: 'Brain', health: 100, status: 'normal', icon: '🧠', position: { x: 50, y: 8 } },
        liver: { name: 'Liver', health: 100, status: 'normal', icon: '🫀', position: { x: 42, y: 42 } },
        kidneys: { name: 'Kidneys', health: 100, status: 'normal', icon: '🫘', position: { x: 50, y: 48 } },
        stomach: { name: 'GI System', health: 100, status: 'normal', icon: '🟤', position: { x: 50, y: 45 } }
    });

    // Calculate organ health based on vitals
    useEffect(() => {
        if (!vitals) return;

        const hr = vitals.heartRate || 75;
        const spo2 = vitals.spo2 || 97;
        const temp = vitals.temperature || 36.8;

        // Heart health based on HR
        let heartHealth = 100;
        let heartStatus = 'normal';
        if (hr > 130 || hr < 50) {
            heartHealth = 40;
            heartStatus = 'critical';
        } else if (hr > 110 || hr < 60) {
            heartHealth = 70;
            heartStatus = 'warning';
        } else if (hr > 100 || hr < 65) {
            heartHealth = 85;
            heartStatus = 'elevated';
        }

        // Lung health based on SpO2
        let lungHealth = 100;
        let lungStatus = 'normal';
        if (spo2 < 90) {
            lungHealth = 35;
            lungStatus = 'critical';
        } else if (spo2 < 94) {
            lungHealth = 60;
            lungStatus = 'warning';
        } else if (spo2 < 96) {
            lungHealth = 80;
            lungStatus = 'elevated';
        }

        // Brain health (affected by oxygenation)
        let brainHealth = 100;
        let brainStatus = 'normal';
        if (spo2 < 88) {
            brainHealth = 50;
            brainStatus = 'critical';
        } else if (spo2 < 92) {
            brainHealth = 75;
            brainStatus = 'warning';
        }

        // General health based on temperature
        let generalHealth = 100;
        let generalStatus = 'normal';
        if (temp > 39.5 || temp < 35) {
            generalHealth = 50;
            generalStatus = 'critical';
        } else if (temp > 38.5 || temp < 36) {
            generalHealth = 70;
            generalStatus = 'warning';
        }

        setOrganSystems(prev => ({
            ...prev,
            heart: { ...prev.heart, health: heartHealth, status: heartStatus },
            lungs: { ...prev.lungs, health: lungHealth, status: lungStatus },
            brain: { ...prev.brain, health: brainHealth, status: brainStatus },
            liver: { ...prev.liver, health: generalHealth, status: generalStatus },
            kidneys: { ...prev.kidneys, health: Math.round((heartHealth + lungHealth) / 2), status: heartHealth < 70 || lungHealth < 70 ? 'warning' : 'normal' },
            stomach: { ...prev.stomach, health: generalHealth, status: generalStatus }
        }));
    }, [vitals]);

    // Animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimationPhase(prev => (prev + 1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'var(--status-critical)';
            case 'warning': return 'var(--status-warning)';
            case 'elevated': return 'var(--accent-secondary)';
            default: return 'var(--status-normal)';
        }
    };

    const getHealthGradient = (health) => {
        if (health >= 80) return 'linear-gradient(180deg, #10b981 0%, #059669 100%)';
        if (health >= 60) return 'linear-gradient(180deg, #f59e0b 0%, #d97706 100%)';
        return 'linear-gradient(180deg, #ef4444 0%, #dc2626 100%)';
    };

    // Calculate overall digital twin health
    const overallHealth = Math.round(
        Object.values(organSystems).reduce((sum, org) => sum + org.health, 0) / Object.keys(organSystems).length
    );

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🧬</span>
                        <span className="vital-title">Digital Twin Visualization</span>
                    </div>
                    <div className="d-flex gap-2">
                        <select
                            className="form-select form-select-sm ll-control"
                            value={viewMode}
                            onChange={(e) => setViewMode(e.target.value)}
                            style={{ width: '120px' }}
                        >
                            <option value="full">Full Body</option>
                            <option value="cardiac">Cardiac</option>
                            <option value="respiratory">Respiratory</option>
                            <option value="neural">Neural</option>
                        </select>
                    </div>
                </div>

                {/* Overall Health Score */}
                <div className="text-center mb-3">
                    <div
                        className="overall-health-ring d-inline-flex align-items-center justify-content-center"
                        style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: getHealthGradient(overallHealth),
                            boxShadow: `0 0 20px ${getStatusColor(overallHealth >= 80 ? 'normal' : overallHealth >= 60 ? 'warning' : 'critical')}40`
                        }}
                    >
                        <div
                            className="inner-circle d-flex flex-column align-items-center justify-content-center"
                            style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--bg-primary)'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{overallHealth}%</span>
                            <small className="text-muted" style={{ fontSize: '0.6rem' }}>HEALTH</small>
                        </div>
                    </div>
                </div>

                {/* Digital Twin Body Visualization */}
                <div
                    className="body-visualization position-relative mb-3 mx-auto"
                    style={{
                        width: '200px',
                        height: '300px',
                        background: 'linear-gradient(180deg, var(--bg-card) 0%, var(--bg-secondary) 100%)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Body Outline SVG */}
                    <svg
                        viewBox="0 0 100 150"
                        style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}
                    >
                        {/* Grid lines for tech feel */}
                        <defs>
                            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="var(--border-color)" strokeWidth="0.3" opacity="0.35" />
                            </pattern>
                            <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="var(--accent-blue)" stopOpacity="0.22" />
                                <stop offset="100%" stopColor="var(--accent-cyan)" stopOpacity="0.14" />
                            </linearGradient>
                        </defs>
                        <rect width="100" height="150" fill="url(#grid)" />

                        {/* Human silhouette */}
                        <ellipse cx="50" cy="12" rx="12" ry="10" fill="url(#bodyGlow)" stroke="var(--accent-blue)" strokeWidth="0.5" /> {/* Head */}
                        <rect x="44" y="22" width="12" height="6" rx="2" fill="url(#bodyGlow)" stroke="var(--accent-blue)" strokeWidth="0.5" /> {/* Neck */}
                        <path
                            d="M 35 28 Q 30 35 28 55 L 28 75 Q 30 80 35 82 L 35 110 Q 36 115 40 120 L 40 140 Q 42 145 45 145 L 55 145 Q 58 145 60 140 L 60 120 Q 64 115 65 110 L 65 82 Q 70 80 72 75 L 72 55 Q 70 35 65 28 Z"
                            fill="url(#bodyGlow)"
                            stroke="var(--accent-blue)"
                            strokeWidth="0.5"
                        />
                        {/* Arms */}
                        <path d="M 28 30 Q 20 40 15 65 Q 14 70 18 70 Q 22 70 24 65 L 28 45" fill="none" stroke="var(--accent-blue)" strokeWidth="0.5" />
                        <path d="M 72 30 Q 80 40 85 65 Q 86 70 82 70 Q 78 70 76 65 L 72 45" fill="none" stroke="var(--accent-blue)" strokeWidth="0.5" />

                        {/* Pulse animation circles */}
                        <circle
                            cx="50"
                            cy="35"
                            r={8 + Math.sin(animationPhase * 0.1) * 2}
                            fill="none"
                            stroke={getStatusColor(organSystems.heart.status)}
                            strokeWidth="0.5"
                            opacity={0.3 + Math.sin(animationPhase * 0.1) * 0.2}
                        />
                    </svg>

                    {/* Organ Indicators */}
                    {Object.entries(organSystems).map(([key, organ]) => (
                        <div
                            key={key}
                            className="organ-indicator position-absolute"
                            style={{
                                left: `${organ.position.x}%`,
                                top: `${organ.position.y}%`,
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                            onClick={() => setSelectedOrgan(key === selectedOrgan ? null : key)}
                        >
                            <div
                                className="organ-dot"
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '50%',
                                    backgroundColor: getStatusColor(organ.status),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.7rem',
                                    boxShadow: `0 0 ${organ.status !== 'normal' ? '10px' : '5px'} ${getStatusColor(organ.status)}`,
                                    animation: organ.status === 'critical' ? 'pulse 1s infinite' : 'none',
                                    border: selectedOrgan === key ? '2px solid white' : 'none'
                                }}
                            >
                                {organ.icon}
                            </div>
                        </div>
                    ))}

                    {/* Vital Overlays */}
                    <div className="vital-overlays position-absolute" style={{ top: '10px', right: '10px' }}>
                        <div className="vital-mini-display p-1 rounded mb-1" style={{ backgroundColor: 'var(--bg-navbar)', border: '1px solid var(--border-color)' }}>
                            <small style={{ color: getStatusColor(organSystems.heart.status) }}>
                                ❤️ {vitals?.heartRate || '--'}
                            </small>
                        </div>
                        <div className="vital-mini-display p-1 rounded mb-1" style={{ backgroundColor: 'var(--bg-navbar)', border: '1px solid var(--border-color)' }}>
                            <small style={{ color: getStatusColor(organSystems.lungs.status) }}>
                                🫁 {vitals?.spo2 || '--'}%
                            </small>
                        </div>
                        <div className="vital-mini-display p-1 rounded" style={{ backgroundColor: 'var(--bg-navbar)', border: '1px solid var(--border-color)' }}>
                            <small className="text-info">
                                🌡️ {vitals?.temperature || '--'}°
                            </small>
                        </div>
                    </div>
                </div>

                {/* Selected Organ Details */}
                {selectedOrgan && (
                    <div
                        className="organ-details p-3 rounded mb-3"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            border: `1px solid ${getStatusColor(organSystems[selectedOrgan].status)}`
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <div>
                                <span style={{ fontSize: '1.5rem' }}>{organSystems[selectedOrgan].icon}</span>
                                <strong className="ms-2">{organSystems[selectedOrgan].name}</strong>
                            </div>
                            <span
                                className="badge"
                                style={{ backgroundColor: getStatusColor(organSystems[selectedOrgan].status) }}
                            >
                                {organSystems[selectedOrgan].status.toUpperCase()}
                            </span>
                        </div>
                        <div className="progress mb-2" style={{ height: '8px' }}>
                            <div
                                className="progress-bar"
                                style={{
                                    width: `${organSystems[selectedOrgan].health}%`,
                                    backgroundColor: getStatusColor(organSystems[selectedOrgan].status)
                                }}
                            />
                        </div>
                        <div className="d-flex justify-content-between">
                            <small className="text-muted">Health Score</small>
                            <small>{organSystems[selectedOrgan].health}%</small>
                        </div>
                    </div>
                )}

                {/* Organ System Status Grid */}
                <div className="organ-grid">
                    <small className="text-muted d-block mb-2">System Status:</small>
                    <div className="row g-2">
                        {Object.entries(organSystems).map(([key, organ]) => (
                            <div key={key} className="col-4">
                                <div
                                    className={`organ-card p-2 rounded text-center ${selectedOrgan === key ? 'border border-info' : ''}`}
                                    style={{
                                        backgroundColor: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        cursor: 'pointer'
                                    }}
                                    onClick={() => setSelectedOrgan(key === selectedOrgan ? null : key)}
                                >
                                    <div style={{ fontSize: '1.2rem' }}>{organ.icon}</div>
                                    <div
                                        className="health-bar mx-auto mt-1"
                                        style={{
                                            width: '80%',
                                            height: '4px',
                                            backgroundColor: 'var(--bg-secondary)',
                                            borderRadius: '2px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: `${organ.health}%`,
                                                height: '100%',
                                                backgroundColor: getStatusColor(organ.status),
                                                transition: 'width 0.5s'
                                            }}
                                        />
                                    </div>
                                    <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>
                                        {organ.name}
                                    </small>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Patient Info */}
                <div className="patient-twin-info mt-3 p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <small className="text-muted">Digital Twin:</small>
                    <div className="small">
                        {patientData?.patientName || 'Unknown Patient'} • {patientData?.patientId || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DigitalTwinVisualizationCard;
