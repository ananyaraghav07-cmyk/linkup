/**
 * LifeLink Twin - History Page
 * 
 * Historical data visualization and analysis
 */

import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
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
    Title,
    Tooltip,
    Legend,
    Filler
);

function History({ patientData, history }) {
    const chartTheme = useChartTheme();
    const [timeRange, setTimeRange] = useState('1h');
    const [selectedVital, setSelectedVital] = useState('all');

    // Generate mock historical data for different time ranges
    const generateHistoricalData = (range) => {
        const now = new Date();
        const dataPoints = range === '1h' ? 60 : range === '6h' ? 72 : range === '24h' ? 96 : 168;

        const timestamps = [];
        const heartRateData = [];
        const spo2Data = [];
        const temperatureData = [];

        for (let i = dataPoints; i >= 0; i--) {
            const time = new Date(now - i * (range === '1h' ? 60000 : range === '6h' ? 300000 : range === '24h' ? 900000 : 3600000));
            timestamps.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));

            // Generate realistic vital signs with some variation
            heartRateData.push(Math.round(75 + Math.random() * 30 + Math.sin(i / 10) * 10));
            spo2Data.push(Math.round(95 + Math.random() * 4 - Math.random() * 2));
            temperatureData.push(36.5 + Math.random() * 1.5);
        }

        return { timestamps, heartRateData, spo2Data, temperatureData };
    };

    const historicalData = generateHistoricalData(timeRange);

    const chartOptions = (title, min, max) => {
        const options = buildLineChartOptions(chartTheme, { title, min, max, showLegend: false });
        options.scales.x.ticks = { ...options.scales.x.ticks, maxTicksLimit: 8 };
        options.animation = { duration: 500 };
        return options;
    };

    const createChartData = (data, color) => ({
        labels: historicalData.timestamps,
        datasets: [{
            data: data,
            borderColor: color,
            backgroundColor: withAlpha(color, 0.12),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
        }]
    });

    // Historical events/incidents
    const historicalEvents = [
        { time: '12:45 PM', date: '2026-01-28', type: 'critical', event: 'Heart rate spiked to 145 BPM' },
        { time: '12:30 PM', date: '2026-01-28', type: 'warning', event: 'SpO2 dropped to 92%' },
        { time: '11:15 AM', date: '2026-01-28', type: 'info', event: 'Vitals stabilized after medication' },
        { time: '10:00 AM', date: '2026-01-28', type: 'info', event: 'Monitoring session started' },
        { time: '09:30 AM', date: '2026-01-28', type: 'info', event: 'Patient admitted' },
        { time: '08:45 PM', date: '2026-01-27', type: 'critical', event: 'Emergency response triggered' },
        { time: '08:30 PM', date: '2026-01-27', type: 'critical', event: 'Cardiac event detected' },
    ];

    return (
        <>
            <div className="page-header mb-4">
                <h1 className="page-title">Patient History</h1>
                <p className="page-subtitle">Historical vital signs data and event timeline</p>
            </div>

            <div className="container-fluid px-0">
                {/* Time Range & Vital Selection */}
                <div className="row g-3 mb-4">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <div className="row g-3 align-items-center">
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted">Time Range</label>
                                        <div className="btn-group w-100" role="group">
                                            {['1h', '6h', '24h', '7d'].map(range => (
                                                <button
                                                    key={range}
                                                    className={`btn ${timeRange === range ? 'btn-primary' : 'btn-outline-primary'}`}
                                                    onClick={() => setTimeRange(range)}
                                                >
                                                    {range === '1h' ? '1 Hour' : range === '6h' ? '6 Hours' : range === '24h' ? '24 Hours' : '7 Days'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="form-label text-muted">Vital Signs</label>
                                        <div className="btn-group w-100" role="group">
                                            <button
                                                className={`btn ${selectedVital === 'all' ? 'btn-secondary' : 'btn-outline-secondary'}`}
                                                onClick={() => setSelectedVital('all')}
                                            >
                                                All
                                            </button>
                                            <button
                                                className={`btn ${selectedVital === 'heartRate' ? 'btn-danger' : 'btn-outline-danger'}`}
                                                onClick={() => setSelectedVital('heartRate')}
                                            >
                                                ❤️ Heart Rate
                                            </button>
                                            <button
                                                className={`btn ${selectedVital === 'spo2' ? 'btn-info' : 'btn-outline-info'}`}
                                                onClick={() => setSelectedVital('spo2')}
                                            >
                                                🫁 SpO2
                                            </button>
                                            <button
                                                className={`btn ${selectedVital === 'temperature' ? 'btn-warning' : 'btn-outline-warning'}`}
                                                onClick={() => setSelectedVital('temperature')}
                                            >
                                                🌡️ Temp
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                {(selectedVital === 'all' || selectedVital === 'heartRate') && (
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <div className="card vital-card">
                                <div className="card-body">
                                    <div style={{ height: '200px' }}>
                                        <Line
                                            data={createChartData(historicalData.heartRateData, chartTheme.heart)}
                                            options={chartOptions('❤️ Heart Rate (BPM)', 50, 160)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(selectedVital === 'all' || selectedVital === 'spo2') && (
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <div className="card vital-card">
                                <div className="card-body">
                                    <div style={{ height: '200px' }}>
                                        <Line
                                            data={createChartData(historicalData.spo2Data, chartTheme.spo2)}
                                            options={chartOptions('🫁 Oxygen Saturation (%)', 85, 100)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {(selectedVital === 'all' || selectedVital === 'temperature') && (
                    <div className="row g-3 mb-3">
                        <div className="col-12">
                            <div className="card vital-card">
                                <div className="card-body">
                                    <div style={{ height: '200px' }}>
                                        <Line
                                            data={createChartData(historicalData.temperatureData, chartTheme.temp)}
                                            options={chartOptions('🌡️ Temperature (°C)', 35, 40)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Event Timeline */}
                <div className="row g-3">
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title mb-4">📅 Event Timeline</h5>
                                <div className="timeline">
                                    {historicalEvents.map((event, index) => (
                                        <div key={index} className="timeline-item">
                                            <div className={`timeline-marker ${event.type}`}></div>
                                            <div className="timeline-content">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <span className={`badge ${event.type === 'critical' ? 'bg-danger' : event.type === 'warning' ? 'bg-warning text-dark' : 'bg-info'} me-2`}>
                                                            {event.type}
                                                        </span>
                                                        <span style={{ color: 'var(--text-primary)' }}>{event.event}</span>
                                                    </div>
                                                    <small className="text-muted">{event.date} {event.time}</small>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default History;
