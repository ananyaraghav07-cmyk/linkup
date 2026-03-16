/**
 * LifeLink Twin - Edge vs Cloud Decision Split Visualizer
 * 
 * Shows real-time visualization of where data processing happens -
 * edge device (ambulance) vs cloud server, with latency comparison.
 */

import { useState, useEffect } from 'react';
import DashboardCard from './DashboardCard';

function EdgeCloudVisualizerCard({ connected }) {
    const [metrics, setMetrics] = useState({
        edgeProcessed: 0,
        cloudProcessed: 0,
        edgeLatency: 0,
        cloudLatency: 0,
        currentDecision: 'edge',
        dataFlow: []
    });

    // Simulate edge/cloud processing decisions
    useEffect(() => {
        const interval = setInterval(() => {
            const random = Math.random();
            const isEdge = random > 0.3; // 70% edge, 30% cloud

            setMetrics(prev => {
                const newFlow = [
                    ...prev.dataFlow.slice(-9),
                    {
                        id: Date.now(),
                        type: isEdge ? 'edge' : 'cloud',
                        dataType: ['vitals', 'alerts', 'prediction', 'sync'][Math.floor(Math.random() * 4)],
                        latency: isEdge ? Math.round(5 + Math.random() * 15) : Math.round(50 + Math.random() * 100),
                        timestamp: new Date().toLocaleTimeString()
                    }
                ];

                return {
                    edgeProcessed: prev.edgeProcessed + (isEdge ? 1 : 0),
                    cloudProcessed: prev.cloudProcessed + (isEdge ? 0 : 1),
                    edgeLatency: Math.round(8 + Math.random() * 12),
                    cloudLatency: Math.round(60 + Math.random() * 80),
                    currentDecision: isEdge ? 'edge' : 'cloud',
                    dataFlow: newFlow
                };
            });
        }, 1500);

        return () => clearInterval(interval);
    }, []);

    const totalProcessed = metrics.edgeProcessed + metrics.cloudProcessed;
    const edgePercent = totalProcessed > 0 ? (metrics.edgeProcessed / totalProcessed * 100) : 70;
    const cloudPercent = totalProcessed > 0 ? (metrics.cloudProcessed / totalProcessed * 100) : 30;

    return (
        <DashboardCard
            icon="⚡"
            title="Edge vs Cloud Processing"
            headerRight={(
                <span className={`badge ${metrics.currentDecision === 'edge' ? 'bg-success' : 'bg-primary'}`}>
                    {metrics.currentDecision === 'edge' ? '🚑 EDGE' : '☁️ CLOUD'}
                </span>
            )}
        >
            {/* Visual Architecture */}
            <div className="architecture-visual mb-3 p-3 rounded" style={{ overflow: 'hidden', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                <div className="d-flex flex-column flex-sm-row justify-content-between align-items-stretch align-items-sm-center gap-3">
                    {/* Edge Device */}
                    <div className="text-center" style={{ flex: '0 0 auto' }}>
                        <div
                            className={`architecture-node p-2 rounded ${metrics.currentDecision === 'edge' ? 'border border-success' : ''}`}
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                        >
                            <span style={{ fontSize: '2rem' }}>🚑</span>
                            <div className="small mt-1">Edge Device</div>
                            <div className="badge bg-success mt-1">{metrics.edgeLatency}ms</div>
                        </div>
                    </div>

                    {/* Data Flow Animation */}
                    <div className="flex-grow-1 px-1 px-sm-3" style={{ minWidth: 0 }}>
                        <div className="data-flow-line position-relative" style={{ height: '4px', backgroundColor: 'var(--bg-secondary)', borderRadius: '999px', border: '1px solid var(--border-color)' }}>
                            <div
                                className={`data-packet position-absolute ${metrics.currentDecision === 'edge' ? 'bg-success' : 'bg-primary'}`}
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    top: '-4px',
                                    animation: `flowPacket 1.5s infinite`,
                                    left: metrics.currentDecision === 'edge' ? '20%' : '80%'
                                }}
                            />
                        </div>
                        <div className="d-flex justify-content-between mt-1">
                            <small className="text-success">Local</small>
                            <small className="text-primary">Remote</small>
                        </div>
                    </div>

                    {/* Cloud Server */}
                    <div className="text-center" style={{ flex: '0 0 auto' }}>
                        <div
                            className={`architecture-node p-2 rounded ${metrics.currentDecision === 'cloud' ? 'border border-primary' : ''}`}
                            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                        >
                            <span style={{ fontSize: '2rem' }}>☁️</span>
                            <div className="small mt-1">Cloud Server</div>
                            <div className="badge bg-primary mt-1">{metrics.cloudLatency}ms</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Split Ratio Bar */}
            <div className="mb-3">
                <div className="d-flex justify-content-between mb-1" style={{ gap: '12px' }}>
                    <small className="text-success text-truncate">Edge: {edgePercent.toFixed(1)}%</small>
                    <small className="text-primary text-truncate">Cloud: {cloudPercent.toFixed(1)}%</small>
                </div>
                <div className="progress" style={{ height: '20px', overflow: 'hidden' }}>
                    <div className="progress-bar bg-success" style={{ width: `${edgePercent}%`, transition: 'width 0.5s' }}>
                        {metrics.edgeProcessed}
                    </div>
                    <div className="progress-bar bg-primary" style={{ width: `${cloudPercent}%`, transition: 'width 0.5s' }}>
                        {metrics.cloudProcessed}
                    </div>
                </div>
            </div>

            {/* Decision Criteria */}
            <div className="decision-criteria mb-3">
                <small className="text-muted d-block mb-2">Decision Criteria:</small>
                <div className="row g-2">
                    <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                            <span className="badge bg-success me-2">✓</span>
                            <small>Vitals → Edge</small>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                            <span className="badge bg-success me-2">✓</span>
                            <small>Alerts → Edge</small>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">☁️</span>
                            <small>ML Model → Cloud</small>
                        </div>
                    </div>
                    <div className="col-12 col-sm-6">
                        <div className="d-flex align-items-center">
                            <span className="badge bg-primary me-2">☁️</span>
                            <small>History → Cloud</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Data Flow */}
            <div className="recent-flow">
                <small className="text-muted d-block mb-2">Recent Data Flow:</small>
                <div className="flow-list" style={{ maxHeight: '120px', overflowY: 'auto', overflowX: 'hidden' }}>
                    {metrics.dataFlow.slice().reverse().map((flow) => (
                        <div
                            key={flow.id}
                            className="d-flex justify-content-between align-items-center py-1 border-bottom border-secondary"
                            style={{ fontSize: '0.75rem', gap: '10px' }}
                        >
                            <span className="text-truncate" style={{ minWidth: 0 }}>
                                <span className={`badge me-1 ${flow.type === 'edge' ? 'bg-success' : 'bg-primary'}`} style={{ fontSize: '0.6rem' }}>
                                    {flow.type.toUpperCase()}
                                </span>
                                {flow.dataType}
                            </span>
                            <span className="text-muted" style={{ flex: '0 0 auto' }}>{flow.latency}ms</span>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes flowPacket {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }
            `}</style>
        </DashboardCard>
    );
}

export default EdgeCloudVisualizerCard;
