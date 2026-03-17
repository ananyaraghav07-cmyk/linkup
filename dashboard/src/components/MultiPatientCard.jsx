/**
 * LifeLink Twin - Multi-Patient Overview Card
 * 
 * Shows all connected ambulances/patients with dropdown selection
 * and detailed view for the selected patient.
 * Optimized for dark and light mode.
 */

import { useMemo, useState } from 'react';
import { useLanguage } from '../i18n';
import DashboardCard from './DashboardCard';

function MultiPatientCard({
    patients,
    allPatientsData,
    selectedPatientId,
    onSelectPatient
}) {
    const { t } = useLanguage();

    const [search, setSearch] = useState('');

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'var(--status-critical, #ef4444)';
            case 'warning': return 'var(--status-warning, #f59e0b)';
            default: return 'var(--status-normal, #10b981)';
        }
    };

    const getStatusBg = (status) => {
        switch (status) {
            case 'critical': return 'rgba(239, 68, 68, 0.15)';
            case 'warning': return 'rgba(245, 158, 11, 0.15)';
            default: return 'rgba(16, 185, 129, 0.15)';
        }
    };

    const getConditionIcon = (condition) => {
        switch (condition) {
            case 'Cardiac': return '❤️';
            case 'Trauma': return '🩹';
            case 'Respiratory': return '🫁';
            case 'Stroke': return '🧠';
            default: return '🏥';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'critical': return `🔴 ${t('critical')}`;
            case 'warning': return `🟡 ${t('warning')}`;
            default: return `🟢 ${t('stable')}`;
        }
    };

    const statusCounts = useMemo(() => {
        return (patients || []).reduce((acc, patient) => {
            const data = allPatientsData?.[patient.id];
            const status = data?.status || 'normal';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
    }, [patients, allPatientsData]);

    const selectedPatient = useMemo(() => (patients || []).find((p) => p.id === selectedPatientId) || null, [patients, selectedPatientId]);
    const selectedData = allPatientsData?.[selectedPatientId] || null;
    const selectedStatus = selectedData?.status || 'normal';
    const selectedVitals = selectedData?.vitals || {};

    const filteredPatients = useMemo(() => {
        const q = String(search || '').trim().toLowerCase();
        if (!q) return patients || [];

        return (patients || []).filter((p) => {
            const hay = `${p.id} ${p.name} ${p.ambulance} ${p.location} ${p.condition}`.toLowerCase();
            return hay.includes(q);
        });
    }, [patients, search]);

    return (
        <DashboardCard
            icon="🚑"
            title={t('livePatientMonitor')}
            headerRight={(
                <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {statusCounts.critical > 0 && (
                        <span className="badge bg-danger">{statusCounts.critical} {t('critical')}</span>
                    )}
                    {statusCounts.warning > 0 && (
                        <span className="badge bg-warning text-dark">{statusCounts.warning} {t('warning')}</span>
                    )}
                    <span className="badge bg-success">{statusCounts.normal || 0} {t('stable')}</span>
                </div>
            )}
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3" style={{ overflow: 'visible' }}>
                {/* Selector */}
                <div className="lg:col-span-1" style={{ minWidth: 0 }}>
                    <div className="mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="d-block" style={{ color: 'var(--text-muted)' }}>{t('selectPatient')}</small>
                            {selectedPatient && (
                                <small className="text-truncate" style={{ color: 'var(--text-secondary)', maxWidth: '55%' }}>
                                    {getStatusLabel(selectedStatus)}
                                </small>
                            )}
                        </div>
                    </div>

                    {/* Mobile: simple dropdown */}
                    <div className="lg:hidden">
                        <select
                            className="form-select ll-control"
                            value={selectedPatientId}
                            onChange={(e) => onSelectPatient?.(e.target.value)}
                        >
                            {(patients || []).map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.id} • {p.name} ({p.ambulance})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop: search + list */}
                    <div className="hidden lg:block">
                        <input
                            type="text"
                            className="form-control ll-control"
                            placeholder="Search patient / ambulance / location"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        <div
                            className="mt-2 rounded"
                            style={{
                                border: '1px solid var(--border-color)',
                                background: 'var(--bg-input)',
                                maxHeight: '320px',
                                overflowY: 'auto',
                                overflowX: 'hidden',
                            }}
                        >
                            {filteredPatients.map((patient) => {
                                const pData = allPatientsData?.[patient.id];
                                const pStatus = pData?.status || 'normal';
                                const pVitals = pData?.vitals || {};
                                const isSelected = patient.id === selectedPatientId;

                                return (
                                    <button
                                        key={patient.id}
                                        type="button"
                                        onClick={() => onSelectPatient?.(patient.id)}
                                        className="w-100 text-start"
                                        style={{
                                            background: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                                            border: 'none',
                                            borderBottom: '1px solid var(--border-color)',
                                            padding: '10px 12px',
                                            color: 'var(--text-primary)',
                                            boxShadow: isSelected ? 'inset 3px 0 0 var(--accent-blue)' : 'none',
                                        }}
                                    >
                                        <div className="d-flex align-items-center justify-content-between" style={{ gap: '10px' }}>
                                            <div className="d-flex align-items-center" style={{ gap: '10px', minWidth: 0 }}>
                                                <span style={{ fontSize: '1.2rem' }}>{getConditionIcon(patient.condition)}</span>
                                                <span
                                                    style={{
                                                        width: '10px',
                                                        height: '10px',
                                                        borderRadius: '50%',
                                                        backgroundColor: getStatusColor(pStatus),
                                                        boxShadow: `0 0 10px ${getStatusColor(pStatus)}40`,
                                                        flex: '0 0 auto',
                                                    }}
                                                />
                                                <div className="text-truncate" style={{ minWidth: 0 }}>
                                                    <div className="fw-semibold text-truncate">{patient.name}</div>
                                                    <div className="small text-truncate" style={{ color: 'var(--text-muted)' }}>
                                                        {patient.id} • {patient.ambulance}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="d-flex" style={{ gap: '10px', flex: '0 0 auto', color: 'var(--text-secondary)' }}>
                                                <small style={{ color: pVitals.heartRate > 120 ? 'var(--status-critical)' : 'var(--text-secondary)' }}>❤️ {pVitals.heartRate ?? '--'}</small>
                                                <small style={{ color: pVitals.spo2 < 90 ? 'var(--status-critical)' : 'var(--text-secondary)' }}>🫁 {pVitals.spo2 ?? '--'}%</small>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}

                            {filteredPatients.length === 0 && (
                                <div className="p-3" style={{ color: 'var(--text-muted)' }}>No matches.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected patient details */}
                <div className="lg:col-span-2" style={{ minWidth: 0 }}>
                    {selectedPatient ? (
                        <div
                            className="p-3 rounded"
                            style={{
                                backgroundColor: getStatusBg(selectedStatus),
                                border: `1px solid ${getStatusColor(selectedStatus)}`,
                                boxShadow: '0 10px 30px var(--shadow-color)',
                                overflow: 'hidden',
                            }}
                        >
                            <div className="d-flex justify-content-between align-items-start" style={{ gap: '12px' }}>
                                <div style={{ minWidth: 0 }}>
                                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                                        <span style={{ fontSize: '1.6rem' }}>{getConditionIcon(selectedPatient.condition)}</span>
                                        <div style={{ minWidth: 0 }}>
                                            <div className="fw-bold text-truncate" style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>
                                                {selectedPatient.name}
                                            </div>
                                            <div className="small text-truncate" style={{ color: 'var(--text-muted)' }}>
                                                {selectedPatient.id} • {selectedPatient.ambulance}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="small mt-2 text-truncate" style={{ color: 'var(--text-muted)' }}>
                                        📍 {selectedPatient.location}
                                    </div>
                                    <div className="mt-2 d-flex" style={{ gap: '8px', flexWrap: 'wrap' }}>
                                        <span className="badge" style={{ background: 'var(--accent-blue)', color: '#fff' }}>{t('monitoring')}</span>
                                        <span className="badge" style={{ backgroundColor: 'transparent', border: `1px solid ${getStatusColor(selectedStatus)}`, color: getStatusColor(selectedStatus) }}>
                                            {selectedPatient.condition}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-end" style={{ flex: '0 0 auto' }}>
                                    <span className="badge" style={{ backgroundColor: getStatusColor(selectedStatus), color: '#fff' }}>
                                        {selectedStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>

                            {/* Vitals Summary */}
                            {selectedData && (
                                <div className="vitals-summary pt-3 border-top" style={{ borderColor: 'var(--border-color) !important' }}>
                                    <div className="row g-2">
                                        <div className="col-4">
                                            <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                                <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('heartRate')}</span>
                                                <span className="d-block fw-bold" style={{
                                                    color: selectedVitals.heartRate > 120 ? 'var(--status-critical)' : selectedVitals.heartRate > 100 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {selectedVitals.heartRate || '--'} <small style={{ color: 'var(--text-muted)' }}>{t('bpm')}</small>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                                <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('spo2')}</span>
                                                <span className="d-block fw-bold" style={{
                                                    color: selectedVitals.spo2 < 90 ? 'var(--status-critical)' : selectedVitals.spo2 < 95 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {selectedVitals.spo2 || '--'}<small style={{ color: 'var(--text-muted)' }}>%</small>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="col-4">
                                            <div className="vital-box text-center p-2 rounded" style={{ backgroundColor: 'var(--bg-input)' }}>
                                                <span className="d-block small" style={{ color: 'var(--text-muted)' }}>{t('temperature')}</span>
                                                <span className="d-block fw-bold" style={{
                                                    color: selectedVitals.temperature > 38.5 ? 'var(--status-critical)' : selectedVitals.temperature > 37.5 ? 'var(--status-warning)' : 'var(--status-normal)',
                                                    fontSize: '1.2rem'
                                                }}>
                                                    {selectedVitals.temperature?.toFixed(1) || '--'}<small style={{ color: 'var(--text-muted)' }}>{t('celsius')}</small>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <div style={{ color: 'var(--text-muted)' }}>No patient selected.</div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .multi-patient-card button:hover {
                    background: var(--bg-card-hover) !important;
                }
            `}</style>
        </DashboardCard>
    );
}

export default MultiPatientCard;