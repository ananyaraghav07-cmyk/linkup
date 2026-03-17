/**
 * LifeLink Twin - Dashboard Page
 * 
 * Main dashboard with vital signs overview and multi-patient support.
 * Doctor-only view.
 */
import { lazy, Suspense, useMemo } from 'react';
import HeartRateCard from '../components/HeartRateCard';
import Spo2Card from '../components/Spo2Card';
import TemperatureCard from '../components/TemperatureCard';
import StatusCard from '../components/StatusCard';
import PredictiveHealthCard from '../components/PredictiveHealthCard';
import HospitalReadinessCard from '../components/HospitalReadinessCard';
import MultiPatientCard from '../components/MultiPatientCard';
import DoctorAlertReviewCard from '../components/DoctorAlertReviewCard';
// Role-Based Access Control
import { isMedicalRole, getRoleIcon } from '../utils/rbac';

import { computeDoctorMetrics } from '../modules/doctorMonitoring';

const AmbulanceTrackerCard = lazy(() => import('../components/AmbulanceTrackerCard'));
const DigitalTwinVisualizationCard = lazy(() => import('../components/DigitalTwinVisualizationCard'));

function CardFallback({ title = 'Loading…' }) {
    return (
        <div className="card vital-card">
            <div className="card-body">
                <div className="vital-header">
                    <span className="vital-icon">⏳</span>
                    <span className="vital-title">{title}</span>
                </div>
            </div>
        </div>
    );
}

function Dashboard({
    patientData,
    history,
    patients,
    allPatientsData,
    allPatientsHistory,
    selectedPatientId,
    onSelectPatient,
    simulatorOn,
    worsenState,
    onTriggerWorsen,
    onStopWorsen,
    userRole // New prop for RBAC
}) {
    const vitals = patientData?.vitals || {};
    const status = patientData?.status || 'normal';

    const doctorMetricsByPatientId = useMemo(() => {
        // Works in simulator mode (multi-patient histories). In socket mode, computes
        // for the selected patient (if history is available), and best-effort for others.
        const out = {};
        for (const p of patients || []) {
            const d = allPatientsData?.[p.id];
            if (!d) continue;

            const h = (allPatientsHistory && allPatientsHistory[p.id])
                ? allPatientsHistory[p.id]
                : (p.id === selectedPatientId ? history : null);

            const metrics = computeDoctorMetrics({ patient: d, history: h });
            if (metrics) out[p.id] = metrics;
        }
        return out;
    }, [patients, allPatientsData, allPatientsHistory, selectedPatientId, history]);

    const DashboardGrid = ({ children }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {children}
        </div>
    );

    // Doctor Dashboard
    if (isMedicalRole(userRole)) {
        return (
            <>
                {/* Page Header */}
                <div className="page-header mb-4">
                    <h1 className="page-title">{getRoleIcon(userRole)} Patient Care Dashboard</h1>
                    <p className="page-subtitle">
                        Real-time patient monitoring • {patients?.length || 0} Digital Twins Active
                        {patientData && (
                            <span className="ms-2 badge bg-info">
                                Viewing: {patientData.patientName} ({patientData.ambulance})
                            </span>
                        )}
                    </p>
                </div>

                <div className="space-y-8">
                    <DashboardGrid>
                        {/* Multi-Patient Overview (full width) */}
                        {patients && patients.length > 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                                <MultiPatientCard
                                    patients={patients}
                                    allPatientsData={allPatientsData}
                                    doctorMetricsByPatientId={doctorMetricsByPatientId}
                                    selectedPatientId={selectedPatientId}
                                    onSelectPatient={onSelectPatient}
                                />
                            </div>
                        )}

                        {/* Alert Review (full width) */}
                        {patients && patients.length > 0 && (
                            <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                                <DoctorAlertReviewCard
                                    patients={patients}
                                    allPatientsData={allPatientsData}
                                    doctorMetricsByPatientId={doctorMetricsByPatientId}
                                    onSelectPatient={onSelectPatient}
                                />
                            </div>
                        )}

                        {/* Primary vitals */}
                        <div className="min-w-0">
                            <HeartRateCard value={vitals.heartRate} history={history} status={status} />
                        </div>
                        <div className="min-w-0">
                            <Spo2Card value={vitals.spo2} status={status} />
                        </div>
                        <div className="min-w-0">
                            <TemperatureCard value={vitals.temperature} status={status} />
                        </div>
                        <div className="min-w-0">
                            <StatusCard
                                status={status}
                                patientName={patientData?.patientName}
                                patientId={patientData?.patientId}
                                alerts={patientData?.alerts}
                            />
                        </div>

                        {/* Secondary insights */}
                        <div className="sm:col-span-2 min-w-0">
                            <PredictiveHealthCard
                                vitals={vitals}
                                history={history}
                                patientId={selectedPatientId}
                                simulatorOn={simulatorOn}
                                worsenState={worsenState}
                                onTriggerWorsen={onTriggerWorsen}
                                onStopWorsen={onStopWorsen}
                            />
                        </div>
                        <div className="sm:col-span-2 min-w-0">
                            <HospitalReadinessCard patientData={patientData} />
                        </div>

                        {/* Larger widgets */}
                        <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                            <Suspense fallback={<CardFallback title="Ambulance Tracker" />}>
                                <AmbulanceTrackerCard />
                            </Suspense>
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                            <Suspense fallback={<CardFallback title="Digital Twin Visualization" />}>
                                <DigitalTwinVisualizationCard vitals={vitals} patientData={patientData} />
                            </Suspense>
                        </div>
                    </DashboardGrid>
                </div>
            </>
        );
    }
    return (
        <>
            <div className="page-header mb-4">
                <h1 className="page-title">🔒 Access Restricted</h1>
                <p className="page-subtitle">This dashboard is available to doctors only.</p>
            </div>
        </>
    );
}

export default Dashboard;
