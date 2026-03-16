/**
 * LifeLink Twin - Settings Page
 * 
 * Application settings and preferences
 */

import { useState } from 'react';

function Settings() {
    const [settings, setSettings] = useState({
        // Alert Settings
        alertSound: true,
        alertVolume: 70,
        criticalAlertRepeat: true,
        alertNotifications: true,

        // Display Settings
        darkMode: true,
        compactView: false,
        showAnimations: true,
        autoRefresh: true,
        refreshInterval: 1,

        // Threshold Settings
        heartRateHigh: 130,
        heartRateLow: 50,
        spo2Critical: 90,
        spo2Warning: 94,
        temperatureHigh: 39,
        temperatureLow: 35,

        // Connection Settings
        serverUrl: 'http://localhost:3000',
        reconnectAttempts: 5,
        reconnectDelay: 1000,

        // Data Settings
        dataRetention: 24,
        exportFormat: 'pdf',
        autoBackup: true
    });

    const [saved, setSaved] = useState(false);

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
        setSaved(false);
    };

    const handleSave = () => {
        // In real app, save to localStorage or backend
        localStorage.setItem('lifelink-settings', JSON.stringify(settings));
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to defaults?')) {
            setSettings({
                alertSound: true,
                alertVolume: 70,
                criticalAlertRepeat: true,
                alertNotifications: true,
                darkMode: true,
                compactView: false,
                showAnimations: true,
                autoRefresh: true,
                refreshInterval: 1,
                heartRateHigh: 130,
                heartRateLow: 50,
                spo2Critical: 90,
                spo2Warning: 94,
                temperatureHigh: 39,
                temperatureLow: 35,
                serverUrl: 'http://localhost:3000',
                reconnectAttempts: 5,
                reconnectDelay: 1000,
                dataRetention: 24,
                exportFormat: 'pdf',
                autoBackup: true
            });
        }
    };

    return (
        <>
            <div className="page-header mb-4">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
                    <div>
                        <h1 className="page-title">Settings</h1>
                        <p className="page-subtitle">Configure application preferences and thresholds</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-outline-secondary" onClick={handleReset}>
                            🔄 Reset to Defaults
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            {saved ? '✓ Saved!' : '💾 Save Settings'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="container-fluid px-0">
                <div className="row g-4">
                    {/* Alert Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">🔔 Alert Settings</h5>

                                <div className="setting-item mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Alert Sound</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.alertSound}
                                                onChange={(e) => handleChange('alertSound', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Play sound when alerts occur</small>
                                </div>

                                <div className="setting-item mb-4">
                                    <label className="d-block mb-2">Alert Volume: {settings.alertVolume}%</label>
                                    <input
                                        type="range"
                                        className="form-range"
                                        min="0"
                                        max="100"
                                        value={settings.alertVolume}
                                        onChange={(e) => handleChange('alertVolume', parseInt(e.target.value))}
                                        disabled={!settings.alertSound}
                                    />
                                </div>

                                <div className="setting-item mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Repeat Critical Alerts</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.criticalAlertRepeat}
                                                onChange={(e) => handleChange('criticalAlertRepeat', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Repeat sound for critical alerts until acknowledged</small>
                                </div>

                                <div className="setting-item">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Push Notifications</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.alertNotifications}
                                                onChange={(e) => handleChange('alertNotifications', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Send browser notifications for alerts</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Display Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">🎨 Display Settings</h5>

                                <div className="setting-item mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Dark Mode</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.darkMode}
                                                onChange={(e) => handleChange('darkMode', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Use dark theme (recommended for monitoring)</small>
                                </div>

                                <div className="setting-item mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Compact View</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.compactView}
                                                onChange={(e) => handleChange('compactView', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Show more information in less space</small>
                                </div>

                                <div className="setting-item mb-4">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label>Show Animations</label>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.showAnimations}
                                                onChange={(e) => handleChange('showAnimations', e.target.checked)}
                                            />
                                        </div>
                                    </div>
                                    <small className="text-muted">Enable UI animations and transitions</small>
                                </div>

                                <div className="setting-item">
                                    <label className="d-block mb-2">Auto-Refresh Interval</label>
                                    <select
                                        className="form-select ll-control"
                                        value={settings.refreshInterval}
                                        onChange={(e) => handleChange('refreshInterval', parseInt(e.target.value))}
                                    >
                                        <option value={1}>1 second (Real-time)</option>
                                        <option value={5}>5 seconds</option>
                                        <option value={10}>10 seconds</option>
                                        <option value={30}>30 seconds</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Vital Sign Thresholds */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">❤️ Vital Sign Thresholds</h5>

                                <div className="setting-group mb-4">
                                    <h6 className="text-muted mb-3">Heart Rate (BPM)</h6>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small">High Threshold</label>
                                            <input
                                                type="number"
                                                className="form-control ll-control"
                                                value={settings.heartRateHigh}
                                                onChange={(e) => handleChange('heartRateHigh', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Low Threshold</label>
                                            <input
                                                type="number"
                                                className="form-control ll-control"
                                                value={settings.heartRateLow}
                                                onChange={(e) => handleChange('heartRateLow', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="setting-group mb-4">
                                    <h6 className="text-muted mb-3">SpO2 (%)</h6>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small">Critical Level</label>
                                            <input
                                                type="number"
                                                className="form-control ll-control"
                                                value={settings.spo2Critical}
                                                onChange={(e) => handleChange('spo2Critical', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Warning Level</label>
                                            <input
                                                type="number"
                                                className="form-control ll-control"
                                                value={settings.spo2Warning}
                                                onChange={(e) => handleChange('spo2Warning', parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="setting-group">
                                    <h6 className="text-muted mb-3">Temperature (°C)</h6>
                                    <div className="row g-3">
                                        <div className="col-6">
                                            <label className="form-label small">High (Fever)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="form-control ll-control"
                                                value={settings.temperatureHigh}
                                                onChange={(e) => handleChange('temperatureHigh', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className="col-6">
                                            <label className="form-label small">Low (Hypothermia)</label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                className="form-control ll-control"
                                                value={settings.temperatureLow}
                                                onChange={(e) => handleChange('temperatureLow', parseFloat(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Connection Settings */}
                    <div className="col-12 col-lg-6">
                        <div className="card vital-card h-100">
                            <div className="card-body">
                                <h5 className="card-title mb-4">🌐 Connection Settings</h5>

                                <div className="setting-item mb-4">
                                    <label className="form-label">Server URL</label>
                                    <input
                                        type="text"
                                        className="form-control ll-control"
                                        value={settings.serverUrl}
                                        onChange={(e) => handleChange('serverUrl', e.target.value)}
                                    />
                                    <small className="text-muted">LifeLink backend server address</small>
                                </div>

                                <div className="setting-item mb-4">
                                    <label className="form-label">Reconnect Attempts</label>
                                    <input
                                        type="number"
                                        className="form-control ll-control"
                                        value={settings.reconnectAttempts}
                                        onChange={(e) => handleChange('reconnectAttempts', parseInt(e.target.value))}
                                    />
                                    <small className="text-muted">Number of reconnection attempts before giving up</small>
                                </div>

                                <div className="setting-item">
                                    <label className="form-label">Reconnect Delay (ms)</label>
                                    <input
                                        type="number"
                                        className="form-control ll-control"
                                        value={settings.reconnectDelay}
                                        onChange={(e) => handleChange('reconnectDelay', parseInt(e.target.value))}
                                    />
                                    <small className="text-muted">Time between reconnection attempts</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Settings */}
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body">
                                <h5 className="card-title mb-4">💾 Data & Export Settings</h5>

                                <div className="row g-4">
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Data Retention (hours)</label>
                                        <select
                                            className="form-select ll-control"
                                            value={settings.dataRetention}
                                            onChange={(e) => handleChange('dataRetention', parseInt(e.target.value))}
                                        >
                                            <option value={6}>6 hours</option>
                                            <option value={12}>12 hours</option>
                                            <option value={24}>24 hours</option>
                                            <option value={48}>48 hours</option>
                                            <option value={168}>7 days</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label">Default Export Format</label>
                                        <select
                                            className="form-select ll-control"
                                            value={settings.exportFormat}
                                            onChange={(e) => handleChange('exportFormat', e.target.value)}
                                        >
                                            <option value="pdf">PDF Document</option>
                                            <option value="csv">CSV Spreadsheet</option>
                                            <option value="json">JSON Data</option>
                                        </select>
                                    </div>
                                    <div className="col-12 col-md-4">
                                        <label className="form-label d-block">Auto Backup</label>
                                        <div className="form-check form-switch mt-2">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={settings.autoBackup}
                                                onChange={(e) => handleChange('autoBackup', e.target.checked)}
                                            />
                                            <label className="form-check-label">Enable automatic data backup</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* About Section */}
                    <div className="col-12">
                        <div className="card vital-card">
                            <div className="card-body text-center py-4">
                                <h4>🏥 LifeLink Twin</h4>
                                <p className="text-muted mb-2">Emergency Health IoT Digital Twin System</p>
                                <p className="mb-0">
                                    <span className="badge bg-primary me-2">Version 1.0.0</span>
                                    <span className="badge bg-secondary">Build 2026.01.28</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Settings;
