/**
 * LifeLink Twin - Vitals Monitor Page
 * 
 * Detailed vital signs monitoring with larger charts and more data
 */

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { buildLineChartOptions, useChartTheme, withAlpha } from '../utils/chartTheme';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function VitalsMonitor({ patientData, history }) {
    const chartTheme = useChartTheme();
    const vitals = patientData?.vitals || {};
    const status = patientData?.status || 'normal';

    // Heart Rate Chart
    const heartRateData = {
        labels: history?.timestamps?.slice(-60) || [],
        datasets: [{
            label: 'Heart Rate (BPM)',
            data: history?.heartRate?.slice(-60) || [],
            borderColor: chartTheme.heart,
            backgroundColor: withAlpha(chartTheme.heart, 0.14),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 1,
        }]
    };

    // SpO2 Chart
    const spo2Data = {
        labels: history?.timestamps?.slice(-60) || [],
        datasets: [{
            label: 'SpO2 (%)',
            data: history?.spo2?.slice(-60) || [],
            borderColor: chartTheme.spo2,
            backgroundColor: withAlpha(chartTheme.spo2, 0.14),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 1,
        }]
    };

    // Temperature Chart
    const tempData = {
        labels: history?.timestamps?.slice(-60) || [],
        datasets: [{
            label: 'Temperature (°C)',
            data: history?.temperature?.slice(-60) || [],
            borderColor: chartTheme.temp,
            backgroundColor: withAlpha(chartTheme.temp, 0.14),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 1,
        }]
    };

    const chartOptions = (min, max) => buildLineChartOptions(chartTheme, { min, max, showLegend: true });

    const getStatusColor = (value, type) => {
        if (type === 'heartRate') {
            if (value > 130) return 'text-danger';
            if (value > 120) return 'text-warning';
            return 'text-success';
        }
        if (type === 'spo2') {
            if (value < 90) return 'text-danger';
            if (value < 94) return 'text-warning';
            return 'text-success';
        }
        if (type === 'temperature') {
            if (value > 39) return 'text-danger';
            if (value > 38.5) return 'text-warning';
            return 'text-success';
        }
        return 'text-muted';
    };

    return (
        <>
            <div className="page-header mb-4">
                <h1 className="page-title">Vitals Monitor</h1>
                <p className="page-subtitle">Detailed vital signs analysis • Real-time tracking</p>
            </div>

            <div className="container-fluid px-0">
                {/* Summary Cards Row */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-4">
                        <div className="card vital-card">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">❤️ Heart Rate</h6>
                                <h2 className={`mb-0 ${getStatusColor(vitals.heartRate, 'heartRate')}`}>
                                    {vitals.heartRate || '--'} <small>BPM</small>
                                </h2>
                                <small className="text-muted">Normal: 60-100 BPM</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card vital-card">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">🫁 Oxygen Saturation</h6>
                                <h2 className={`mb-0 ${getStatusColor(vitals.spo2, 'spo2')}`}>
                                    {vitals.spo2 || '--'} <small>%</small>
                                </h2>
                                <small className="text-muted">Normal: 95-100%</small>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-md-4">
                        <div className="card vital-card">
                            <div className="card-body text-center">
                                <h6 className="text-muted mb-2">🌡️ Temperature</h6>
                                <h2 className={`mb-0 ${getStatusColor(vitals.temperature, 'temperature')}`}>
                                    {vitals.temperature?.toFixed(1) || '--'} <small>°C</small>
                                </h2>
                                <small className="text-muted">Normal: 36.1-37.2°C</small>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heart Rate Chart */}
                <div className="row g-3 mb-3">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title">❤️ Heart Rate Trend</h5>
                                <div style={{ height: '250px' }}>
                                    <Line data={heartRateData} options={chartOptions(40, 180)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* SpO2 & Temperature Charts */}
                <div className="row g-3">
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title">🫁 SpO2 Trend</h5>
                                <div style={{ height: '200px' }}>
                                    <Line data={spo2Data} options={chartOptions(80, 100)} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title">🌡️ Temperature Trend</h5>
                                <div style={{ height: '200px' }}>
                                    <Line data={tempData} options={chartOptions(35, 41)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Vital Statistics */}
                <div className="row g-3 mt-3">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title">📊 Session Statistics</h5>
                                <div className="table-responsive">
                                    <table className="table table-hover ll-table">
                                        <thead>
                                            <tr>
                                                <th>Vital Sign</th>
                                                <th>Current</th>
                                                <th>Min</th>
                                                <th>Max</th>
                                                <th>Average</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>Heart Rate</td>
                                                <td>{vitals.heartRate || '--'} BPM</td>
                                                <td>{history?.heartRate?.length ? Math.min(...history.heartRate) : '--'}</td>
                                                <td>{history?.heartRate?.length ? Math.max(...history.heartRate) : '--'}</td>
                                                <td>{history?.heartRate?.length ? Math.round(history.heartRate.reduce((a, b) => a + b, 0) / history.heartRate.length) : '--'}</td>
                                                <td><span className={`badge ${vitals.heartRate > 120 ? 'bg-warning' : 'bg-success'}`}>
                                                    {vitals.heartRate > 130 ? 'Critical' : vitals.heartRate > 120 ? 'Elevated' : 'Normal'}
                                                </span></td>
                                            </tr>
                                            <tr>
                                                <td>SpO2</td>
                                                <td>{vitals.spo2 || '--'}%</td>
                                                <td>{history?.spo2?.length ? Math.min(...history.spo2) : '--'}%</td>
                                                <td>{history?.spo2?.length ? Math.max(...history.spo2) : '--'}%</td>
                                                <td>{history?.spo2?.length ? Math.round(history.spo2.reduce((a, b) => a + b, 0) / history.spo2.length) : '--'}%</td>
                                                <td><span className={`badge ${vitals.spo2 < 94 ? 'bg-warning' : 'bg-success'}`}>
                                                    {vitals.spo2 < 90 ? 'Critical' : vitals.spo2 < 94 ? 'Low' : 'Normal'}
                                                </span></td>
                                            </tr>
                                            <tr>
                                                <td>Temperature</td>
                                                <td>{vitals.temperature?.toFixed(1) || '--'}°C</td>
                                                <td>{history?.temperature?.length ? Math.min(...history.temperature).toFixed(1) : '--'}°C</td>
                                                <td>{history?.temperature?.length ? Math.max(...history.temperature).toFixed(1) : '--'}°C</td>
                                                <td>{history?.temperature?.length ? (history.temperature.reduce((a, b) => a + b, 0) / history.temperature.length).toFixed(1) : '--'}°C</td>
                                                <td><span className={`badge ${vitals.temperature > 38.5 ? 'bg-warning' : 'bg-success'}`}>
                                                    {vitals.temperature > 39 ? 'Fever' : vitals.temperature > 38.5 ? 'Elevated' : 'Normal'}
                                                </span></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default VitalsMonitor;
