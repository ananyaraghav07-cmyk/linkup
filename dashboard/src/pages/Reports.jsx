/**
 * LifeLink Twin - Reports Page
 * 
 * Generate, download, and print comprehensive patient reports
 */

import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function Reports({ patientData, history, events }) {
    const [reportType, setReportType] = useState('summary');
    const [dateRange, setDateRange] = useState({ from: '2026-01-28', to: '2026-01-28' });
    const [isGenerating, setIsGenerating] = useState(false);
    const reportRef = useRef(null);

    const vitals = patientData?.vitals || {};

    // Report data
    const reportData = {
        patient: {
            name: patientData?.patientName || 'John Doe',
            id: patientData?.patientId || 'patient1',
            age: 45,
            gender: 'Male',
            bloodType: 'O+',
            admissionDate: '2026-01-28',
            department: 'Emergency Cardiology',
            physician: 'Dr. Sarah Johnson'
        },
        vitals: {
            current: vitals,
            averages: {
                heartRate: history?.heartRate?.length ? Math.round(history.heartRate.reduce((a, b) => a + b, 0) / history.heartRate.length) : '--',
                spo2: history?.spo2?.length ? Math.round(history.spo2.reduce((a, b) => a + b, 0) / history.spo2.length) : '--',
                temperature: history?.temperature?.length ? (history.temperature.reduce((a, b) => a + b, 0) / history.temperature.length).toFixed(1) : '--'
            },
            ranges: {
                heartRate: { min: history?.heartRate?.length ? Math.min(...history.heartRate) : '--', max: history?.heartRate?.length ? Math.max(...history.heartRate) : '--' },
                spo2: { min: history?.spo2?.length ? Math.min(...history.spo2) : '--', max: history?.spo2?.length ? Math.max(...history.spo2) : '--' },
                temperature: { min: history?.temperature?.length ? Math.min(...history.temperature).toFixed(1) : '--', max: history?.temperature?.length ? Math.max(...history.temperature).toFixed(1) : '--' }
            }
        },
        alerts: events.filter(e => e.type === 'critical' || e.type === 'warning'),
        medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', lastAdministered: '12:00 PM' },
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', lastAdministered: '08:00 AM' },
            { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', lastAdministered: '08:00 AM' }
        ]
    };

    // Generate PDF Report
    const generatePDF = () => {
        setIsGenerating(true);

        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, pageWidth, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('LifeLink Twin', 14, 20);
        doc.setFontSize(12);
        doc.text('Patient Health Report', 14, 30);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 30, { align: 'right' });

        // Reset text color
        doc.setTextColor(0, 0, 0);

        let yPos = 50;

        // Patient Information Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Patient Information', 14, yPos);
        yPos += 10;

        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        const patientInfo = [
            ['Name', reportData.patient.name],
            ['Patient ID', reportData.patient.id],
            ['Age / Gender', `${reportData.patient.age} years / ${reportData.patient.gender}`],
            ['Blood Type', reportData.patient.bloodType],
            ['Admission Date', reportData.patient.admissionDate],
            ['Department', reportData.patient.department],
            ['Attending Physician', reportData.patient.physician]
        ];

        doc.autoTable({
            startY: yPos,
            head: [],
            body: patientInfo,
            theme: 'plain',
            styles: { fontSize: 10, cellPadding: 2 },
            columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Current Vitals Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Current Vital Signs', 14, yPos);
        yPos += 5;

        const vitalsTableData = [
            ['Heart Rate', `${vitals.heartRate || '--'} BPM`, `${reportData.vitals.averages.heartRate} BPM`, `${reportData.vitals.ranges.heartRate.min}-${reportData.vitals.ranges.heartRate.max} BPM`],
            ['SpO2', `${vitals.spo2 || '--'}%`, `${reportData.vitals.averages.spo2}%`, `${reportData.vitals.ranges.spo2.min}-${reportData.vitals.ranges.spo2.max}%`],
            ['Temperature', `${vitals.temperature?.toFixed(1) || '--'}°C`, `${reportData.vitals.averages.temperature}°C`, `${reportData.vitals.ranges.temperature.min}-${reportData.vitals.ranges.temperature.max}°C`]
        ];

        doc.autoTable({
            startY: yPos,
            head: [['Vital Sign', 'Current', 'Average', 'Range']],
            body: vitalsTableData,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] },
            styles: { fontSize: 10 }
        });

        yPos = doc.lastAutoTable.finalY + 15;

        // Alerts Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Recent Alerts', 14, yPos);
        yPos += 5;

        const alertsData = reportData.alerts.slice(0, 10).map(alert => [
            alert.type.toUpperCase(),
            alert.message,
            alert.time
        ]);

        if (alertsData.length > 0) {
            doc.autoTable({
                startY: yPos,
                head: [['Severity', 'Description', 'Time']],
                body: alertsData,
                theme: 'striped',
                headStyles: { fillColor: [30, 41, 59] },
                styles: { fontSize: 9 },
                columnStyles: {
                    0: { cellWidth: 25 },
                    2: { cellWidth: 25 }
                }
            });
            yPos = doc.lastAutoTable.finalY + 15;
        } else {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text('No alerts recorded during this period.', 14, yPos + 5);
            yPos += 20;
        }

        // Medications Section
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.text('Current Medications', 14, yPos);
        yPos += 5;

        const medsData = reportData.medications.map(med => [
            med.name,
            med.dosage,
            med.frequency,
            med.lastAdministered
        ]);

        doc.autoTable({
            startY: yPos,
            head: [['Medication', 'Dosage', 'Frequency', 'Last Administered']],
            body: medsData,
            theme: 'striped',
            headStyles: { fillColor: [30, 41, 59] },
            styles: { fontSize: 10 }
        });

        // Footer
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(128);
            doc.text(
                `Page ${i} of ${pageCount} | LifeLink Twin - Emergency Health IoT Digital Twin System`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Save the PDF
        doc.save(`LifeLink_Report_${reportData.patient.id}_${new Date().toISOString().split('T')[0]}.pdf`);
        setIsGenerating(false);
    };

    // Print Report
    const handlePrint = () => {
        const printContent = document.getElementById('printable-report');
        const printWindow = window.open('', '_blank');

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>LifeLink Twin - Patient Report</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                    .report-header { background: #1e293b; color: white; padding: 20px; margin-bottom: 20px; }
                    .report-header h1 { font-size: 24px; margin-bottom: 5px; }
                    .report-header p { font-size: 12px; opacity: 0.8; }
                    .section { margin-bottom: 25px; }
                    .section-title { font-size: 16px; font-weight: bold; border-bottom: 2px solid #1e293b; padding-bottom: 5px; margin-bottom: 10px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
                    th { background: #1e293b; color: white; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
                    .info-item { padding: 5px 0; }
                    .info-item label { font-weight: bold; display: block; font-size: 11px; color: #666; }
                    .info-item span { font-size: 13px; }
                    .alert-critical { color: #dc3545; font-weight: bold; }
                    .alert-warning { color: #ffc107; font-weight: bold; }
                    .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 10px; color: #666; text-align: center; }
                    @media print {
                        body { padding: 0; }
                        .report-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="report-header">
                    <h1>🏥 LifeLink Twin</h1>
                    <p>Patient Health Report | Generated: ${new Date().toLocaleString()}</p>
                </div>

                <div class="section">
                    <div class="section-title">Patient Information</div>
                    <div class="info-grid">
                        <div class="info-item"><label>Name</label><span>${reportData.patient.name}</span></div>
                        <div class="info-item"><label>Patient ID</label><span>${reportData.patient.id}</span></div>
                        <div class="info-item"><label>Age / Gender</label><span>${reportData.patient.age} years / ${reportData.patient.gender}</span></div>
                        <div class="info-item"><label>Blood Type</label><span>${reportData.patient.bloodType}</span></div>
                        <div class="info-item"><label>Admission Date</label><span>${reportData.patient.admissionDate}</span></div>
                        <div class="info-item"><label>Department</label><span>${reportData.patient.department}</span></div>
                        <div class="info-item"><label>Attending Physician</label><span>${reportData.patient.physician}</span></div>
                    </div>
                </div>

                <div class="section">
                    <div class="section-title">Current Vital Signs</div>
                    <table>
                        <thead>
                            <tr><th>Vital Sign</th><th>Current</th><th>Average</th><th>Range</th></tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>❤️ Heart Rate</td>
                                <td>${vitals.heartRate || '--'} BPM</td>
                                <td>${reportData.vitals.averages.heartRate} BPM</td>
                                <td>${reportData.vitals.ranges.heartRate.min}-${reportData.vitals.ranges.heartRate.max} BPM</td>
                            </tr>
                            <tr>
                                <td>🫁 SpO2</td>
                                <td>${vitals.spo2 || '--'}%</td>
                                <td>${reportData.vitals.averages.spo2}%</td>
                                <td>${reportData.vitals.ranges.spo2.min}-${reportData.vitals.ranges.spo2.max}%</td>
                            </tr>
                            <tr>
                                <td>🌡️ Temperature</td>
                                <td>${vitals.temperature?.toFixed(1) || '--'}°C</td>
                                <td>${reportData.vitals.averages.temperature}°C</td>
                                <td>${reportData.vitals.ranges.temperature.min}-${reportData.vitals.ranges.temperature.max}°C</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Recent Alerts</div>
                    <table>
                        <thead>
                            <tr><th>Severity</th><th>Description</th><th>Time</th></tr>
                        </thead>
                        <tbody>
                            ${reportData.alerts.length > 0 ? reportData.alerts.slice(0, 10).map(alert => `
                                <tr>
                                    <td class="alert-${alert.type}">${alert.type.toUpperCase()}</td>
                                    <td>${alert.message}</td>
                                    <td>${alert.time}</td>
                                </tr>
                            `).join('') : '<tr><td colspan="3">No alerts recorded</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <div class="section">
                    <div class="section-title">Current Medications</div>
                    <table>
                        <thead>
                            <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Last Administered</th></tr>
                        </thead>
                        <tbody>
                            ${reportData.medications.map(med => `
                                <tr>
                                    <td>${med.name}</td>
                                    <td>${med.dosage}</td>
                                    <td>${med.frequency}</td>
                                    <td>${med.lastAdministered}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <div class="footer">
                    LifeLink Twin - Emergency Health IoT Digital Twin System | Report ID: RPT-${Date.now()}
                </div>
            </body>
            </html>
        `);

        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    };

    return (
        <>
            <div className="page-header mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Reports</h1>
                        <p className="page-subtitle">Generate and download patient health reports</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={generatePDF}
                            disabled={isGenerating}
                        >
                            {isGenerating ? '⏳ Generating...' : '📥 Download PDF'}
                        </button>
                        <button
                            className="btn btn-outline-primary"
                            onClick={handlePrint}
                        >
                            🖨️ Print Report
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-0">
                {/* Report Options */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title mb-3">📋 Report Options</h5>
                                <div className="row g-3">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted">Report Type</label>
                                        <select
                                            className="form-select ll-control"
                                            value={reportType}
                                            onChange={(e) => setReportType(e.target.value)}
                                        >
                                            <option value="summary">Summary Report</option>
                                            <option value="detailed">Detailed Report</option>
                                            <option value="vitals">Vitals Only</option>
                                            <option value="alerts">Alerts Report</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted">From Date</label>
                                        <input
                                            type="date"
                                            className="form-control ll-control"
                                            value={dateRange.from}
                                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label text-muted">To Date</label>
                                        <input
                                            type="date"
                                            className="form-control ll-control"
                                            value={dateRange.to}
                                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Report Preview */}
                <div className="row g-3">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body" id="printable-report" ref={reportRef}>
                                <div className="report-preview">
                                    {/* Header */}
                                    <div className="report-header-preview mb-4 p-3 rounded" style={{ background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(59, 130, 246, 0.12) 100%)', border: '1px solid var(--border-color)' }}>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <h3 className="mb-1">🏥 LifeLink Twin</h3>
                                                <small className="text-muted">Patient Health Report</small>
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted d-block">Generated</small>
                                                <span>{new Date().toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Patient Info */}
                                    <div className="mb-4">
                                        <h5 className="border-bottom pb-2 mb-3">👤 Patient Information</h5>
                                        <div className="row g-3">
                                            <div className="col-6 col-md-3">
                                                <small className="text-muted d-block">Name</small>
                                                <span>{reportData.patient.name}</span>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <small className="text-muted d-block">Patient ID</small>
                                                <span>{reportData.patient.id}</span>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <small className="text-muted d-block">Age / Gender</small>
                                                <span>{reportData.patient.age} / {reportData.patient.gender}</span>
                                            </div>
                                            <div className="col-6 col-md-3">
                                                <small className="text-muted d-block">Blood Type</small>
                                                <span className="text-danger fw-bold">{reportData.patient.bloodType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Vitals */}
                                    <div className="mb-4">
                                        <h5 className="border-bottom pb-2 mb-3">❤️ Vital Signs</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover ll-table">
                                                <thead>
                                                    <tr>
                                                        <th>Vital Sign</th>
                                                        <th>Current</th>
                                                        <th>Average</th>
                                                        <th>Range</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>Heart Rate</td>
                                                        <td>{vitals.heartRate || '--'} BPM</td>
                                                        <td>{reportData.vitals.averages.heartRate} BPM</td>
                                                        <td>{reportData.vitals.ranges.heartRate.min}-{reportData.vitals.ranges.heartRate.max}</td>
                                                        <td><span className="badge bg-success">Normal</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>SpO2</td>
                                                        <td>{vitals.spo2 || '--'}%</td>
                                                        <td>{reportData.vitals.averages.spo2}%</td>
                                                        <td>{reportData.vitals.ranges.spo2.min}-{reportData.vitals.ranges.spo2.max}%</td>
                                                        <td><span className="badge bg-success">Normal</span></td>
                                                    </tr>
                                                    <tr>
                                                        <td>Temperature</td>
                                                        <td>{vitals.temperature?.toFixed(1) || '--'}°C</td>
                                                        <td>{reportData.vitals.averages.temperature}°C</td>
                                                        <td>{reportData.vitals.ranges.temperature.min}-{reportData.vitals.ranges.temperature.max}°C</td>
                                                        <td><span className="badge bg-success">Normal</span></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Alerts */}
                                    <div className="mb-4">
                                        <h5 className="border-bottom pb-2 mb-3">🚨 Recent Alerts ({reportData.alerts.length})</h5>
                                        {reportData.alerts.length > 0 ? (
                                            <div className="table-responsive">
                                                <table className="table table-hover ll-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Severity</th>
                                                            <th>Description</th>
                                                            <th>Time</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {reportData.alerts.slice(0, 5).map((alert, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    <span className={`badge ${alert.type === 'critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                                        {alert.type.toUpperCase()}
                                                                    </span>
                                                                </td>
                                                                <td>{alert.message}</td>
                                                                <td>{alert.time}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <p className="text-muted">No alerts during this period.</p>
                                        )}
                                    </div>

                                    {/* Medications */}
                                    <div className="mb-4">
                                        <h5 className="border-bottom pb-2 mb-3">💊 Current Medications</h5>
                                        <div className="table-responsive">
                                            <table className="table table-hover ll-table">
                                                <thead>
                                                    <tr>
                                                        <th>Medication</th>
                                                        <th>Dosage</th>
                                                        <th>Frequency</th>
                                                        <th>Last Administered</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportData.medications.map((med, index) => (
                                                        <tr key={index}>
                                                            <td>{med.name}</td>
                                                            <td>{med.dosage}</td>
                                                            <td>{med.frequency}</td>
                                                            <td>{med.lastAdministered}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="report-footer pt-3 border-top">
                                        <small className="text-muted">
                                            Report ID: RPT-{Date.now()} | LifeLink Twin - Emergency Health IoT Digital Twin System
                                        </small>
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

export default Reports;
