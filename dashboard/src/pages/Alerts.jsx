/**
 * LifeLink Twin - Alerts Page
 * 
 * Alert management center with filtering and acknowledgment
 */

import { useState } from 'react';

function Alerts({ events, patientData }) {
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Mock comprehensive alerts data
    const allAlerts = [
        { id: 1, type: 'critical', title: 'Heart Rate Critical', message: 'Heart rate exceeded 140 BPM', time: '12:45:23', date: '2026-01-28', acknowledged: false },
        { id: 2, type: 'critical', title: 'SpO2 Critical', message: 'Oxygen saturation dropped below 88%', time: '12:44:15', date: '2026-01-28', acknowledged: false },
        { id: 3, type: 'warning', title: 'Temperature Elevated', message: 'Body temperature at 38.7°C', time: '12:40:00', date: '2026-01-28', acknowledged: true },
        { id: 4, type: 'warning', title: 'Heart Rate Elevated', message: 'Heart rate at 122 BPM', time: '12:35:45', date: '2026-01-28', acknowledged: true },
        { id: 5, type: 'info', title: 'Vitals Stabilizing', message: 'Patient vitals returning to normal range', time: '12:30:00', date: '2026-01-28', acknowledged: true },
        { id: 6, type: 'critical', title: 'Arrhythmia Detected', message: 'Irregular heartbeat pattern detected', time: '12:25:00', date: '2026-01-28', acknowledged: false },
        { id: 7, type: 'warning', title: 'Blood Pressure Alert', message: 'Systolic pressure elevated to 160 mmHg', time: '12:20:00', date: '2026-01-28', acknowledged: true },
        { id: 8, type: 'info', title: 'Medication Reminder', message: 'Next dose of Metformin due in 30 minutes', time: '12:15:00', date: '2026-01-28', acknowledged: true },
        ...events.map((e, i) => ({
            id: 100 + i,
            type: e.type,
            title: e.type.charAt(0).toUpperCase() + e.type.slice(1) + ' Alert',
            message: e.message,
            time: e.time,
            date: '2026-01-28',
            acknowledged: false
        }))
    ];

    const [alerts, setAlerts] = useState(allAlerts);

    const filteredAlerts = alerts.filter(alert => {
        const matchesFilter = filter === 'all' || alert.type === filter;
        const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.title.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const acknowledgeAlert = (id) => {
        setAlerts(alerts.map(alert =>
            alert.id === id ? { ...alert, acknowledged: true } : alert
        ));
    };

    const acknowledgeAll = () => {
        setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })));
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'critical': return '🚨';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return '📋';
        }
    };

    const getAlertBadgeClass = (type) => {
        switch (type) {
            case 'critical': return 'bg-danger';
            case 'warning': return 'bg-warning text-dark';
            case 'info': return 'bg-info';
            default: return 'bg-secondary';
        }
    };

    const criticalCount = alerts.filter(a => a.type === 'critical' && !a.acknowledged).length;
    const warningCount = alerts.filter(a => a.type === 'warning' && !a.acknowledged).length;
    const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length;

    return (
        <>
            <div className="page-header mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Alerts Center</h1>
                        <p className="page-subtitle">Monitor and manage patient alerts • {unacknowledgedCount} unacknowledged</p>
                    </div>
                    <button
                        className="btn btn-outline-success"
                        onClick={acknowledgeAll}
                        disabled={unacknowledgedCount === 0}
                    >
                        ✓ Acknowledge All
                    </button>
                </div>
            </div>

            <div className="container-fluid px-0">
                {/* Summary Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-6 col-md-3">
                        <div className="card vital-card text-center" style={{ borderLeft: '4px solid #dc3545' }}>
                            <div className="card-body py-3">
                                <h3 className="text-danger mb-0">{criticalCount}</h3>
                                <small className="text-muted">Critical Alerts</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card vital-card text-center" style={{ borderLeft: '4px solid #ffc107' }}>
                            <div className="card-body py-3">
                                <h3 className="text-warning mb-0">{warningCount}</h3>
                                <small className="text-muted">Warnings</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card vital-card text-center" style={{ borderLeft: '4px solid #0dcaf0' }}>
                            <div className="card-body py-3">
                                <h3 className="text-info mb-0">{alerts.filter(a => a.type === 'info').length}</h3>
                                <small className="text-muted">Info Notices</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-6 col-md-3">
                        <div className="card vital-card text-center" style={{ borderLeft: '4px solid #198754' }}>
                            <div className="card-body py-3">
                                <h3 className="text-success mb-0">{alerts.filter(a => a.acknowledged).length}</h3>
                                <small className="text-muted">Acknowledged</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <div className="row g-3 align-items-center">
                                    <div className="col-12 col-md-6">
                                        <input
                                            type="text"
                                            className="form-control ll-control"
                                            placeholder="🔍 Search alerts..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="btn-group w-100" role="group">
                                            <button
                                                className={`btn ${filter === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                                                onClick={() => setFilter('all')}
                                            >
                                                All
                                            </button>
                                            <button
                                                className={`btn ${filter === 'critical' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                onClick={() => setFilter('critical')}
                                            >
                                                🚨 Critical
                                            </button>
                                            <button
                                                className={`btn ${filter === 'warning' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => setFilter('warning')}
                                            >
                                                ⚠️ Warning
                                            </button>
                                            <button
                                                className={`btn ${filter === 'info' ? 'btn-info' : 'btn-outline-info'}`}
                                                onClick={() => setFilter('info')}
                                            >
                                                ℹ️ Info
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alerts List */}
                <div className="row g-3">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body p-0">
                                <div className="alerts-list">
                                    {filteredAlerts.length === 0 ? (
                                        <div className="text-center py-5 text-muted">
                                            <span style={{ fontSize: '3rem' }}>✅</span>
                                            <p className="mt-3">No alerts matching your criteria</p>
                                        </div>
                                    ) : (
                                        filteredAlerts.map((alert) => (
                                            <div
                                                key={alert.id}
                                                className={`alert-item p-3 border-bottom border-secondary ${alert.acknowledged ? 'opacity-50' : ''}`}
                                                style={{
                                                    borderLeft: `4px solid ${alert.type === 'critical' ? '#dc3545' : alert.type === 'warning' ? '#ffc107' : '#0dcaf0'}`,
                                                    borderColor: 'var(--border-color)'
                                                }}
                                            >
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div className="d-flex gap-3">
                                                        <span style={{ fontSize: '1.5rem' }}>{getAlertIcon(alert.type)}</span>
                                                        <div>
                                                            <div className="d-flex align-items-center gap-2 mb-1">
                                                                <h6 className="mb-0">{alert.title}</h6>
                                                                <span className={`badge ${getAlertBadgeClass(alert.type)}`}>
                                                                    {alert.type}
                                                                </span>
                                                                {alert.acknowledged && (
                                                                    <span className="badge bg-success">✓ Acknowledged</span>
                                                                )}
                                                            </div>
                                                            <p className="mb-1" style={{ color: 'var(--text-primary)' }}>{alert.message}</p>
                                                            <small className="text-muted">{alert.date} at {alert.time}</small>
                                                        </div>
                                                    </div>
                                                    {!alert.acknowledged && (
                                                        <button
                                                            className="btn btn-sm btn-outline-success"
                                                            onClick={() => acknowledgeAlert(alert.id)}
                                                        >
                                                            Acknowledge
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Alerts;
