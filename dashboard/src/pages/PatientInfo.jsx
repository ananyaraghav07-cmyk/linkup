/**
 * LifeLink Twin - Patient Info Page
 * 
 * Comprehensive patient information and medical history
 */

import { useState } from 'react';

function PatientInfo({ patientData }) {
    const [editMode, setEditMode] = useState(false);

    // Mock patient details (in real app, this would come from backend)
    const patientDetails = {
        // Personal Information
        name: patientData?.patientName || 'Sharanya Sharma',
        id: patientData?.patientId || 'AMB-001',
        age: Number.isFinite(patientData?.patientAge) ? patientData.patientAge : 18,
        gender: patientData?.patientGender || 'Female',
        bloodType: 'AB+',
        dateOfBirth: '2006-03-01',
        phone: '+1 (555) 123-4567',
        email: 'john.doe@email.com',
        address: '123 Medical Center Drive, Healthcare City, HC 12345',

        // Emergency Contact
        emergencyContact: {
            name: 'Jane Doe',
            relation: 'Spouse',
            phone: '+1 (555) 987-6543'
        },

        // Medical Information
        medicalHistory: [
            'Type 2 Diabetes (2015)',
            'Hypertension (2018)',
            'Previous MI (2022)'
        ],
        allergies: ['Penicillin', 'Sulfa drugs'],
        currentMedications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
            { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
        ],

        // Insurance
        insurance: {
            provider: 'HealthCare Plus',
            policyNumber: 'HCP-123456789',
            groupNumber: 'GRP-9876'
        },

        // Admission Details
        admissionDate: '2026-01-28',
        admissionReason: 'Chest pain and shortness of breath',
        attendingPhysician: 'Dr. Sarah Johnson',
        department: 'Emergency Cardiology'
    };

    return (
        <>
            <div className="page-header mb-4">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <h1 className="page-title">Patient Information</h1>
                        <p className="page-subtitle">Complete patient profile and medical history</p>
                    </div>
                    <button
                        className={`btn ${editMode ? 'btn-success' : 'btn-outline-primary'}`}
                        onClick={() => setEditMode(!editMode)}
                    >
                        {editMode ? '✓ Save Changes' : '✏️ Edit Profile'}
                    </button>
                </div>
            </div>

            <div className="container-fluid px-0">
                {/* Patient Header Card */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <div className="row align-items-center">
                                    <div className="col-auto">
                                        <div className="patient-avatar-large">
                                            <span style={{ fontSize: '4rem' }}>👤</span>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <h2 className="mb-1">{patientDetails.name}</h2>
                                        <p className="text-muted mb-2">
                                            ID: {patientDetails.id} • {patientDetails.age} years • {patientDetails.gender} • Blood Type: <span className="text-danger fw-bold">{patientDetails.bloodType}</span>
                                        </p>
                                        <div className="d-flex gap-3">
                                            <span className="badge bg-primary">{patientDetails.department}</span>
                                            <span className="badge bg-info">Dr. {patientDetails.attendingPhysician}</span>
                                            <span className={`badge ${patientData?.status === 'critical' ? 'bg-danger' : patientData?.status === 'warning' ? 'bg-warning' : 'bg-success'}`}>
                                                Status: {patientData?.status?.toUpperCase() || 'STABLE'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row g-3">
                    {/* Personal Information */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">📋 Personal Information</h5>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <span>{patientDetails.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Date of Birth</label>
                                        <span>{patientDetails.dateOfBirth}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone</label>
                                        <span>{patientDetails.phone}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Email</label>
                                        <span>{patientDetails.email}</span>
                                    </div>
                                    <div className="info-item full-width">
                                        <label>Address</label>
                                        <span>{patientDetails.address}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">🚨 Emergency Contact</h5>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Name</label>
                                        <span>{patientDetails.emergencyContact.name}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Relationship</label>
                                        <span>{patientDetails.emergencyContact.relation}</span>
                                    </div>
                                    <div className="info-item full-width">
                                        <label>Phone</label>
                                        <span className="text-warning fw-bold">{patientDetails.emergencyContact.phone}</span>
                                    </div>
                                </div>

                                <hr className="my-4" />

                                <h5 className="card-title mb-4">🏥 Insurance Information</h5>
                                <div className="info-grid">
                                    <div className="info-item">
                                        <label>Provider</label>
                                        <span>{patientDetails.insurance.provider}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Policy Number</label>
                                        <span>{patientDetails.insurance.policyNumber}</span>
                                    </div>
                                    <div className="info-item">
                                        <label>Group Number</label>
                                        <span>{patientDetails.insurance.groupNumber}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Medical History */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">📜 Medical History</h5>
                                <ul className="list-group list-group-flush bg-transparent">
                                    {patientDetails.medicalHistory.map((item, index) => (
                                        <li key={index} className="list-group-item ll-list-item">
                                            <span className="me-2">•</span> {item}
                                        </li>
                                    ))}
                                </ul>

                                <hr className="my-4" />

                                <h5 className="card-title mb-4">⚠️ Allergies</h5>
                                <div className="d-flex gap-2 flex-wrap">
                                    {patientDetails.allergies.map((allergy, index) => (
                                        <span key={index} className="badge bg-danger fs-6">{allergy}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Current Medications */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">💊 Current Medications</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover ll-table">
                                        <thead>
                                            <tr>
                                                <th>Medication</th>
                                                <th>Dosage</th>
                                                <th>Frequency</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {patientDetails.currentMedications.map((med, index) => (
                                                <tr key={index}>
                                                    <td>{med.name}</td>
                                                    <td>{med.dosage}</td>
                                                    <td>{med.frequency}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Admission Details */}
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title mb-4">🏨 Current Admission Details</h5>
                                <div className="row">
                                    <div className="col-md-3">
                                        <div className="info-item">
                                            <label>Admission Date</label>
                                            <span>{patientDetails.admissionDate}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-item">
                                            <label>Department</label>
                                            <span>{patientDetails.department}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-item">
                                            <label>Attending Physician</label>
                                            <span>{patientDetails.attendingPhysician}</span>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-item">
                                            <label>Admission Reason</label>
                                            <span>{patientDetails.admissionReason}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default PatientInfo;
