/**
 * LifeLink Twin - Dashboard Page
 * 
 * Main dashboard with vital signs overview and multi-patient support.
 * Role-based views:
 * - Medical Staff (Doctor/Nurse): Patient vitals, health data, medical info
 * - Admin: System infrastructure, network stats, technical monitoring
 */
import { lazy, Suspense } from 'react';
import HeartRateCard from '../components/HeartRateCard';
import Spo2Card from '../components/Spo2Card';
import TemperatureCard from '../components/TemperatureCard';
import StatusCard from '../components/StatusCard';
import EventLogCard from '../components/EventLogCard';
import PatientLogCard from '../components/PatientLogCard';
import NetworkStatsCard from '../components/NetworkStatsCard';
import PredictiveHealthCard from '../components/PredictiveHealthCard';
import NetworkQoSCard from '../components/NetworkQoSCard';
import HospitalReadinessCard from '../components/HospitalReadinessCard';
import MultiPatientCard from '../components/MultiPatientCard';
// Advanced Features - Phase 2
import EdgeFailureBackupCard from '../components/EdgeFailureBackupCard';
import NationalEmergencyNetworkCard from '../components/NationalEmergencyNetworkCard';
// AI Treatment Recommendations


// Role-Based Access Control
import { isMedicalRole, isAdminRole, getRoleIcon } from '../utils/rbac';

const AmbulanceTrackerCard = lazy(() => import('../components/AmbulanceTrackerCard'));
const DigitalTwinVisualizationCard = lazy(() => import('../components/DigitalTwinVisualizationCard'));
const EdgeCloudVisualizerCard = lazy(() => import('../components/EdgeCloudVisualizerCard'));
const HandoverReportCard = lazy(() => import('../components/HandoverReportCard'));
const ScenarioPlaybackCard = lazy(() => import('../components/ScenarioPlaybackCard'));

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
    events,
    patientLogs,
    connected,
    latency,
    lastUpdate,
    patients,
    allPatientsData,
    selectedPatientId,
    onSelectPatient,
    userRole // New prop for RBAC
}) {
    const vitals = patientData?.vitals || {};
    const status = patientData?.status || 'normal';

    const DashboardGrid = ({ children }) => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5">
            {children}
        </div>
    );

    // Medical Staff Dashboard
    if (isMedicalRole(userRole)) {
        return (
            <>
                {/* Page Header - Medical */}
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
                                    selectedPatientId={selectedPatientId}
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
                            <PredictiveHealthCard vitals={vitals} history={history} />
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
                            <PatientLogCard patientLogs={patientLogs} />
                        </div>
                        <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                            <Suspense fallback={<CardFallback title="Handover Report" />}>
                                <HandoverReportCard
                                    patientData={patientData}
                                    vitals={vitals}
                                    history={history}
                                    ambulanceData={null}
                                />
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

    // Admin Dashboard - System/Technical View
    if (isAdminRole(userRole)) {
        return (
            <>
                {/* Page Header - Admin */}
                <div className="page-header mb-4">
                    <h1 className="page-title">{getRoleIcon(userRole)} System Administration</h1>
                    <p className="page-subtitle">
                        Infrastructure Monitoring • Network Status • Edge Computing
                        <span className={`ms-2 badge ${connected ? 'bg-success' : 'bg-danger'}`}>
                            {connected ? '● System Online' : '○ System Offline'}
                        </span>
                    </p>
                </div>

                <div className="space-y-8">
                    <DashboardGrid>
                        {/* Connection Status Overview */}
                        <div className="min-w-0">
                            <div className="card vital-card h-100" style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #0d47a1 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">🌐</h3>
                                    <h5 className="text-white">System Status</h5>
                                    <h2 className={`${connected ? 'text-success' : 'text-danger'}`}>
                                        {connected ? 'ONLINE' : 'OFFLINE'}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="card vital-card h-100" style={{ background: 'linear-gradient(135deg, #1a472a 0%, #2e7d32 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">⚡</h3>
                                    <h5 className="text-white">Network Latency</h5>
                                    <h2 className="text-success">{latency || 0}ms</h2>
                                </div>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <div className="card vital-card h-100" style={{ background: 'linear-gradient(135deg, #4a1a6b 0%, #7b1fa2 100%)' }}>
                                <div className="card-body text-center">
                                    <h3 className="text-white mb-2">📡</h3>
                                    <h5 className="text-white">Active Connections</h5>
                                    <h2 className="text-info">{patients?.length || 0}</h2>
                                </div>
                            </div>
                        </div>

                        {/* Edge/Cloud + QoS */}
                        <div className="sm:col-span-2 min-w-0">
                            <Suspense fallback={<CardFallback title="Edge vs Cloud Processing" />}>
                                <EdgeCloudVisualizerCard connected={connected} />
                            </Suspense>
                        </div>
                        <div className="sm:col-span-2 min-w-0">
                            <NetworkQoSCard connected={connected} latency={latency} />
                        </div>

                        {/* Backup + National */}
                        <div className="sm:col-span-2 min-w-0">
                            <EdgeFailureBackupCard connected={connected} />
                        </div>
                        <div className="sm:col-span-2 min-w-0">
                            <NationalEmergencyNetworkCard />
                        </div>

                        {/* Event log + stats */}
                        <div className="sm:col-span-2 lg:col-span-2 2xl:col-span-3 min-w-0">
                            <EventLogCard events={events} />
                        </div>
                        <div className="min-w-0">
                            <NetworkStatsCard connected={connected} latency={latency} packetRate={1} lastUpdate={lastUpdate} />
                        </div>

                        {/* Scenario Playback (full width) */}
                        <div className="sm:col-span-2 lg:col-span-3 2xl:col-span-4 min-w-0">
                            <Suspense fallback={<CardFallback title="Scenario Playback" />}>
                                <ScenarioPlaybackCard />
                            </Suspense>
                        </div>
                    </DashboardGrid>
                </div>
            </>
        );
    }

    // Fallback - Default view (shouldn't normally reach here)
    return (
        <div className="page-header mb-4">
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Please contact administrator for access.</p>
        </div>
    );
}

export default Dashboard;
