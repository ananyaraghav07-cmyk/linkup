/**
 * LifeLink Twin - Patient Log Page
 *
 * Dedicated page for viewing the selected patient's log entries.
 */

import PatientLogCard from '../components/PatientLogCard';

function PatientLog({ patientLogs, patientData }) {
    const count = patientLogs?.length || 0;

    return (
        <>
            <div className="page-header mb-4">
                <h1 className="page-title">Patient Log</h1>
                <p className="page-subtitle">
                    Vital changes and key events • {count} {count === 1 ? 'entry' : 'entries'}
                    {patientData?.patientName && (
                        <span className="ms-2 badge bg-info">
                            Viewing: {patientData.patientName} ({patientData.ambulance})
                        </span>
                    )}
                </p>
            </div>

            <div className="space-y-8">
                <div className="min-w-0">
                    <PatientLogCard patientLogs={patientLogs} />
                </div>
            </div>
        </>
    );
}

export default PatientLog;
