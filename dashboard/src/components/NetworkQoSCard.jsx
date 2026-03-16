/**
 * LifeLink Twin - Network Intelligence & QoS Engine
 * 
 * Real-time network quality monitoring, bandwidth allocation,
 * packet priority management, and adaptive streaming.
 */

import { useState, useEffect } from 'react';

function NetworkQoSCard({ connected, latency }) {
    const [qosMetrics, setQosMetrics] = useState({
        bandwidth: { current: 0, max: 100, unit: 'Mbps' },
        packetLoss: 0,
        jitter: 0,
        signalStrength: -50,
        networkType: '5G',
        qosScore: 100,
        priorityQueue: [],
        adaptiveMode: 'high-quality'
    });

    // Simulate network metrics
    useEffect(() => {
        const interval = setInterval(() => {
            const networkTypes = ['5G', '4G LTE', '4G', '3G'];
            const selectedNetwork = networkTypes[Math.floor(Math.random() * 2)]; // Mostly 5G/4G LTE

            const bandwidthByNetwork = {
                '5G': { min: 50, max: 100 },
                '4G LTE': { min: 20, max: 50 },
                '4G': { min: 10, max: 25 },
                '3G': { min: 1, max: 5 }
            };

            const range = bandwidthByNetwork[selectedNetwork];
            const bandwidth = range.min + Math.random() * (range.max - range.min);
            const packetLoss = Math.random() * 2;
            const jitter = Math.random() * 20;
            const signalStrength = -40 - Math.random() * 40;

            // Calculate QoS score
            let qosScore = 100;
            qosScore -= packetLoss * 10;
            qosScore -= Math.max(0, jitter - 10) * 2;
            qosScore -= Math.max(0, (latency || 50) - 50) * 0.5;
            if (signalStrength < -70) qosScore -= 20;
            qosScore = Math.max(0, Math.min(100, qosScore));

            // Determine adaptive mode
            let adaptiveMode = 'high-quality';
            if (qosScore < 50) adaptiveMode = 'low-bandwidth';
            else if (qosScore < 75) adaptiveMode = 'balanced';

            // Generate priority queue
            const priorities = [
                { type: 'Critical Alerts', priority: 1, status: 'active', color: 'danger' },
                { type: 'Vital Signs', priority: 2, status: 'active', color: 'warning' },
                { type: 'Video Stream', priority: 3, status: qosScore > 60 ? 'active' : 'paused', color: 'info' },
                { type: 'History Sync', priority: 4, status: qosScore > 80 ? 'active' : 'queued', color: 'secondary' }
            ];

            setQosMetrics({
                bandwidth: { current: bandwidth, max: 100, unit: 'Mbps' },
                packetLoss,
                jitter,
                signalStrength,
                networkType: selectedNetwork,
                qosScore,
                priorityQueue: priorities,
                adaptiveMode
            });
        }, 2000);

        return () => clearInterval(interval);
    }, [latency]);

    const getQoSColor = (score) => {
        if (score >= 80) return 'var(--status-normal)';
        if (score >= 50) return 'var(--status-warning)';
        return 'var(--status-critical)';
    };

    const getSignalBars = (strength) => {
        if (strength > -50) return 4;
        if (strength > -60) return 3;
        if (strength > -70) return 2;
        return 1;
    };

    const signalBars = getSignalBars(qosMetrics.signalStrength);

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">📡</span>
                        <span className="vital-title">Network QoS Engine</span>
                    </div>
                    <span className={`badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                        {qosMetrics.networkType}
                    </span>
                </div>

                {/* QoS Score */}
                <div className="text-center mb-3">
                    <div className="qos-score d-inline-block position-relative">
                        <svg width="120" height="120" viewBox="0 0 120 120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="var(--bg-input)" strokeWidth="10" />
                            <circle
                                cx="60" cy="60" r="50"
                                fill="none"
                                stroke={getQoSColor(qosMetrics.qosScore)}
                                strokeWidth="10"
                                strokeLinecap="round"
                                strokeDasharray={`${qosMetrics.qosScore * 3.14} 314`}
                                transform="rotate(-90 60 60)"
                                style={{ transition: 'stroke-dasharray 0.5s' }}
                            />
                        </svg>
                        <div className="position-absolute top-50 start-50 translate-middle text-center">
                            <div className="fs-4 fw-bold" style={{ color: getQoSColor(qosMetrics.qosScore) }}>
                                {Math.round(qosMetrics.qosScore)}
                            </div>
                            <small className="text-muted">QoS</small>
                        </div>
                    </div>
                </div>

                {/* Signal Strength */}
                <div className="d-flex justify-content-center mb-3">
                    <div className="signal-bars d-flex align-items-end gap-1">
                        {[1, 2, 3, 4].map(bar => (
                            <div
                                key={bar}
                                style={{
                                    width: '8px',
                                    height: `${bar * 8}px`,
                                    backgroundColor: bar <= signalBars ? 'var(--status-normal)' : 'var(--bg-input)',
                                    borderRadius: '2px',
                                    transition: 'background-color 0.3s'
                                }}
                            />
                        ))}
                    </div>
                    <span className="ms-2 small text-muted">{qosMetrics.signalStrength.toFixed(0)} dBm</span>
                </div>

                {/* Metrics Grid */}
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <small className="text-muted d-block">Bandwidth</small>
                            <span className="fw-bold text-info">
                                {qosMetrics.bandwidth.current.toFixed(1)} Mbps
                            </span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <small className="text-muted d-block">Latency</small>
                            <span className={`fw-bold ${(latency || 0) < 50 ? 'text-success' : 'text-warning'}`}>
                                {latency || 0} ms
                            </span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <small className="text-muted d-block">Packet Loss</small>
                            <span className={`fw-bold ${qosMetrics.packetLoss < 1 ? 'text-success' : 'text-warning'}`}>
                                {qosMetrics.packetLoss.toFixed(2)}%
                            </span>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="rounded p-2 text-center" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <small className="text-muted d-block">Jitter</small>
                            <span className={`fw-bold ${qosMetrics.jitter < 15 ? 'text-success' : 'text-warning'}`}>
                                {qosMetrics.jitter.toFixed(1)} ms
                            </span>
                        </div>
                    </div>
                </div>

                {/* Adaptive Mode */}
                <div className="adaptive-mode mb-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                        <span className="small">Adaptive Mode:</span>
                        <span className={`badge ${qosMetrics.adaptiveMode === 'high-quality' ? 'bg-success' :
                            qosMetrics.adaptiveMode === 'balanced' ? 'bg-warning text-dark' : 'bg-danger'
                            }`}>
                            {qosMetrics.adaptiveMode.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Priority Queue */}
                <div className="priority-queue">
                    <small className="text-muted d-block mb-2">Priority Queue:</small>
                    {qosMetrics.priorityQueue.map((item, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center py-1">
                            <span className="small">
                                <span className="badge bg-secondary me-1" style={{ fontSize: '0.6rem' }}>P{item.priority}</span>
                                {item.type}
                            </span>
                            <span className={`badge bg-${item.color}`} style={{ fontSize: '0.65rem' }}>
                                {item.status.toUpperCase()}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default NetworkQoSCard;
