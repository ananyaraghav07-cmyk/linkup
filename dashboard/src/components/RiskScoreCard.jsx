import { useMemo } from 'react';
import DashboardCard from './DashboardCard';

function RiskScoreCard({ analysis }) {
    const score = analysis?.risk?.score ?? null;
    const level = analysis?.risk?.level ?? '—';

    const badgeClass = useMemo(() => {
        if (level === 'Critical') return 'bg-danger';
        if (level === 'Moderate') return 'bg-warning text-dark';
        return 'bg-success';
    }, [level]);

    return (
        <DashboardCard
            icon="🧮"
            title="Risk Score"
            headerRight={(
                <span className={`badge ${badgeClass}`}>{level}</span>
            )}
        >
            <div className="d-flex align-items-end justify-content-between" style={{ gap: '12px' }}>
                <div>
                    <div className="fw-bold" style={{ fontSize: '2rem', lineHeight: 1 }}>
                        {score ?? '--'}
                    </div>
                    <div className="small" style={{ color: 'var(--text-muted)' }}>0–100</div>
                </div>
                <div className="text-end" style={{ color: 'var(--text-secondary)' }}>
                    <div className="small">Based on vitals + trends</div>
                    <div className="small">Additional baseline validation</div>
                </div>
            </div>
        </DashboardCard>
    );
}

export default RiskScoreCard;
