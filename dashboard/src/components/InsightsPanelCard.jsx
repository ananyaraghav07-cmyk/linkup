import DashboardCard from './DashboardCard';

function InsightsPanelCard({ analysis }) {
    const insights = analysis?.insights || [];
    const action = analysis?.confidence?.action || 'ignore';
    const confidence = analysis?.confidence?.confidence;

    const badge = (() => {
        if (action === 'emergency') return <span className="badge bg-danger">Emergency</span>;
        if (action === 'warning') return <span className="badge bg-warning text-dark">Warning</span>;
        return <span className="badge bg-success">OK</span>;
    })();

    return (
        <DashboardCard
            icon="💡"
            title="Smart Insights"
            headerRight={(
                <div className="d-flex align-items-center" style={{ gap: '8px' }}>
                    {badge}
                    <span className="small" style={{ color: 'var(--text-muted)' }}>{typeof confidence === 'number' ? `${confidence}%` : '--'}</span>
                </div>
            )}
        >
            {insights.length ? (
                <ul className="mb-0" style={{ paddingLeft: '18px' }}>
                    {insights.slice(0, 5).map((msg, idx) => (
                        <li key={idx} style={{ color: 'var(--text-secondary)' }}>{msg}</li>
                    ))}
                </ul>
            ) : (
                <div style={{ color: 'var(--text-muted)' }}>No insights yet.</div>
            )}
        </DashboardCard>
    );
}

export default InsightsPanelCard;
