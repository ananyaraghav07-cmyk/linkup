import DashboardCard from './DashboardCard';

function StabilityIndicatorCard({ analysis }) {
    const stability = analysis?.stability?.stability;
    const label = analysis?.stability?.label || '—';

    const pct = typeof stability === 'number' ? Math.max(0, Math.min(100, stability)) : null;

    return (
        <DashboardCard icon="📶" title="Stability">
            <div className="d-flex align-items-center justify-content-between" style={{ gap: '12px' }}>
                <div>
                    <div className="fw-bold" style={{ fontSize: '1.8rem', lineHeight: 1 }}>
                        {pct ?? '--'}
                    </div>
                    <div className="small" style={{ color: 'var(--text-muted)' }}>{label}</div>
                </div>

                <div className="flex-grow-1">
                    <div className="progress" style={{ height: '10px', backgroundColor: 'var(--bg-input)' }}>
                        <div
                            className="progress-bar"
                            style={{
                                width: `${pct ?? 0}%`,
                                backgroundColor: 'var(--accent-cyan)',
                                transition: 'width 0.4s ease',
                            }}
                        />
                    </div>
                </div>
            </div>
        </DashboardCard>
    );
}

export default StabilityIndicatorCard;
