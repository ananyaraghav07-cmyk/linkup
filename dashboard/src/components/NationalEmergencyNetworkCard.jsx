/**
 * LifeLink Twin - National Emergency Network Simulation
 * 
 * Visualizes a nationwide emergency response network showing:
 * - Multiple regions with ambulance and hospital status
 * - Inter-region coordination and resource sharing
 * - Network load balancing and capacity management
 * - Real-time emergency dispatch simulation
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../i18n';

function NationalEmergencyNetworkCard() {
    const { t } = useLanguage();

    // Dropdown state
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Network regions configuration
    const [regions, setRegions] = useState({
        north: {
            name: 'North Region',
            city: 'Delhi NCR',
            hospitals: 12,
            ambulances: { total: 45, active: 0, available: 0 },
            emergencies: { active: 0, pending: 0, resolved: 0 },
            load: 0,
            status: 'normal',
            coordinates: { x: 50, y: 15 }
        },
        east: {
            name: 'East Region',
            city: 'Kolkata',
            hospitals: 8,
            ambulances: { total: 32, active: 0, available: 0 },
            emergencies: { active: 0, pending: 0, resolved: 0 },
            load: 0,
            status: 'normal',
            coordinates: { x: 78, y: 45 }
        },
        west: {
            name: 'West Region',
            city: 'Mumbai',
            hospitals: 15,
            ambulances: { total: 55, active: 0, available: 0 },
            emergencies: { active: 0, pending: 0, resolved: 0 },
            load: 0,
            status: 'normal',
            coordinates: { x: 22, y: 50 }
        },
        south: {
            name: 'South Region',
            city: 'Bangalore',
            hospitals: 10,
            ambulances: { total: 40, active: 0, available: 0 },
            emergencies: { active: 0, pending: 0, resolved: 0 },
            load: 0,
            status: 'normal',
            coordinates: { x: 45, y: 78 }
        },
        central: {
            name: 'Central Hub',
            city: 'Hyderabad',
            hospitals: 6,
            ambulances: { total: 25, active: 0, available: 0 },
            emergencies: { active: 0, pending: 0, resolved: 0 },
            load: 0,
            status: 'normal',
            coordinates: { x: 50, y: 55 }
        }
    });

    // Network-wide statistics
    const [networkStats, setNetworkStats] = useState({
        totalEmergencies: 0,
        avgResponseTime: 0,
        networkLoad: 0,
        interRegionTransfers: 0,
        activeConnections: 0
    });

    // Active transfers between regions
    const [activeTransfers, setActiveTransfers] = useState([]);

    // Selected region for details
    const [selectedRegion, setSelectedRegion] = useState(null);

    // Simulation state
    const [isSimulating, setIsSimulating] = useState(true);

    // Emergency event log
    const [eventLog, setEventLog] = useState([]);

    // Simulate network activity
    useEffect(() => {
        if (!isSimulating) return;

        const interval = setInterval(() => {
            setRegions(prev => {
                const updated = { ...prev };
                let totalActive = 0;
                let totalLoad = 0;

                Object.keys(updated).forEach(regionKey => {
                    const region = updated[regionKey];

                    // Simulate ambulance activity
                    const activeAmbulances = Math.floor(Math.random() * (region.ambulances.total * 0.6));
                    const availableAmbulances = region.ambulances.total - activeAmbulances;

                    // Simulate emergencies
                    const activeEmergencies = Math.floor(Math.random() * 8) + 1;
                    const pendingEmergencies = Math.floor(Math.random() * 3);
                    const resolvedToday = Math.floor(Math.random() * 20) + 10;

                    // Calculate load
                    const load = Math.round((activeAmbulances / region.ambulances.total) * 100);

                    // Determine status
                    let status = 'normal';
                    if (load > 80) status = 'critical';
                    else if (load > 60) status = 'busy';
                    else if (load > 40) status = 'moderate';

                    updated[regionKey] = {
                        ...region,
                        ambulances: {
                            ...region.ambulances,
                            active: activeAmbulances,
                            available: availableAmbulances
                        },
                        emergencies: {
                            active: activeEmergencies,
                            pending: pendingEmergencies,
                            resolved: resolvedToday
                        },
                        load,
                        status
                    };

                    totalActive += activeEmergencies;
                    totalLoad += load;
                });

                return updated;
            });

            // Update network stats
            setNetworkStats(prev => ({
                totalEmergencies: Object.values(regions).reduce((sum, r) => sum + r.emergencies.active, 0),
                avgResponseTime: Math.round(5 + Math.random() * 8),
                networkLoad: Math.round(Object.values(regions).reduce((sum, r) => sum + r.load, 0) / 5),
                interRegionTransfers: Math.floor(Math.random() * 5),
                activeConnections: Math.floor(Math.random() * 50) + 100
            }));

            // Simulate inter-region transfers
            if (Math.random() > 0.7) {
                const regionKeys = Object.keys(regions);
                const from = regionKeys[Math.floor(Math.random() * regionKeys.length)];
                let to = regionKeys[Math.floor(Math.random() * regionKeys.length)];
                while (to === from) {
                    to = regionKeys[Math.floor(Math.random() * regionKeys.length)];
                }

                const newTransfer = {
                    id: Date.now(),
                    from,
                    to,
                    type: Math.random() > 0.5 ? 'ambulance' : 'resource',
                    startTime: Date.now()
                };

                setActiveTransfers(prev => [...prev.slice(-4), newTransfer]);

                // Add to event log
                setEventLog(prev => [...prev.slice(-9), {
                    time: new Date().toLocaleTimeString(),
                    event: `Resource transfer: ${regions[from].city} → ${regions[to].city}`,
                    type: 'transfer'
                }]);
            }

            // Random emergency events
            if (Math.random() > 0.8) {
                const regionKeys = Object.keys(regions);
                const region = regionKeys[Math.floor(Math.random() * regionKeys.length)];
                const emergencyTypes = ['Cardiac Emergency', 'Traffic Accident', 'Respiratory Distress', 'Trauma Case'];
                const emergencyType = emergencyTypes[Math.floor(Math.random() * emergencyTypes.length)];

                setEventLog(prev => [...prev.slice(-9), {
                    time: new Date().toLocaleTimeString(),
                    event: `${emergencyType} dispatched in ${regions[region].city}`,
                    type: 'emergency'
                }]);
            }

        }, 2000);

        return () => clearInterval(interval);
    }, [isSimulating, regions]);

    // Remove completed transfers
    useEffect(() => {
        const cleanup = setInterval(() => {
            const now = Date.now();
            setActiveTransfers(prev =>
                prev.filter(t => now - t.startTime < 5000)
            );
        }, 1000);

        return () => clearInterval(cleanup);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'critical': return 'var(--status-critical, #ef4444)';
            case 'busy': return 'var(--status-warning, #f59e0b)';
            case 'moderate': return 'var(--accent-blue, #3b82f6)';
            default: return 'var(--status-normal, #10b981)';
        }
    };

    const getLoadColor = (load) => {
        if (load > 80) return 'var(--status-critical, #ef4444)';
        if (load > 60) return 'var(--status-warning, #f59e0b)';
        if (load > 40) return 'var(--accent-blue, #3b82f6)';
        return 'var(--status-normal, #10b981)';
    };

    return (
        <div className="card vital-card">
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🌐</span>
                        <span className="vital-title">{t('nationalEmergencyNetwork')}</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className={`btn btn-sm ${isSimulating ? 'btn-success' : 'btn-outline-success'}`}
                            onClick={() => setIsSimulating(!isSimulating)}
                        >
                            {isSimulating ? `⏸️ ${t('pause')}` : `▶️ ${t('start')}`}
                        </button>
                    </div>
                </div>

                {/* Network Overview Stats */}
                <div className="row g-2 mb-3">
                    <div className="col-3">
                        <div className="stat-mini p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--status-critical)' }}>
                                {networkStats.totalEmergencies}
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{t('active')}</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-mini p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                                {networkStats.avgResponseTime}m
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{t('avgETA')}</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-mini p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: getLoadColor(networkStats.networkLoad) }}>
                                {networkStats.networkLoad}%
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{t('load')}</small>
                        </div>
                    </div>
                    <div className="col-3">
                        <div className="stat-mini p-2 rounded text-center" style={{ backgroundColor: 'var(--bg-input)' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--status-normal)' }}>
                                {networkStats.activeConnections}
                            </div>
                            <small style={{ color: 'var(--text-muted)' }}>{t('nodes')}</small>
                        </div>
                    </div>
                </div>

                {/* Network Map Visualization */}
                <div
                    className="network-map position-relative mb-3"
                    style={{
                        height: '220px',
                        background: 'linear-gradient(180deg, var(--bg-sidebar) 0%, var(--bg-input) 100%)',
                        borderRadius: '12px',
                        border: '1px solid var(--border-color)',
                        overflow: 'hidden'
                    }}
                >
                    {/* Connection Lines */}
                    <svg
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            top: 0,
                            left: 0
                        }}
                    >
                        {/* Static connections */}
                        {Object.entries(regions).map(([key, region]) => {
                            if (key === 'central') return null;
                            return (
                                <line
                                    key={`line-${key}`}
                                    x1={`${region.coordinates.x}%`}
                                    y1={`${region.coordinates.y}%`}
                                    x2={`${regions.central.coordinates.x}%`}
                                    y2={`${regions.central.coordinates.y}%`}
                                    stroke="var(--border-color)"
                                    strokeWidth="1"
                                    strokeDasharray="4,4"
                                />
                            );
                        })}

                        {/* Active transfer animations */}
                        {activeTransfers.map(transfer => (
                            <line
                                key={transfer.id}
                                x1={`${regions[transfer.from].coordinates.x}%`}
                                y1={`${regions[transfer.from].coordinates.y}%`}
                                x2={`${regions[transfer.to].coordinates.x}%`}
                                y2={`${regions[transfer.to].coordinates.y}%`}
                                stroke="var(--accent-blue)"
                                strokeWidth="2"
                                style={{
                                    animation: 'pulse 1s infinite'
                                }}
                            />
                        ))}
                    </svg>

                    {/* Region Nodes */}
                    {Object.entries(regions).map(([key, region]) => (
                        <div
                            key={key}
                            className="region-node position-absolute"
                            style={{
                                left: `${region.coordinates.x}%`,
                                top: `${region.coordinates.y}%`,
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                zIndex: 10
                            }}
                            onClick={() => setSelectedRegion(key === selectedRegion ? null : key)}
                        >
                            <div
                                className="node-circle d-flex flex-column align-items-center justify-content-center"
                                style={{
                                    width: key === 'central' ? '50px' : '40px',
                                    height: key === 'central' ? '50px' : '40px',
                                    borderRadius: '50%',
                                    backgroundColor: 'var(--bg-input)',
                                    border: `3px solid ${getStatusColor(region.status)}`,
                                    boxShadow: `0 0 15px ${getStatusColor(region.status)}50`,
                                    transition: 'all 0.3s'
                                }}
                            >
                                <span style={{ fontSize: key === 'central' ? '1.2rem' : '0.9rem' }}>
                                    {key === 'central' ? '🏛️' : '🏥'}
                                </span>
                                <small style={{ fontSize: '0.5rem', color: 'var(--text-muted)' }}>
                                    {region.emergencies.active}
                                </small>
                            </div>
                            <div className="text-center mt-1">
                                <small style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>
                                    {region.city.split(' ')[0]}
                                </small>
                            </div>
                        </div>
                    ))}

                    {/* Legend */}
                    <div className="legend position-absolute" style={{ bottom: '10px', left: '10px' }}>
                        <div className="d-flex gap-2">
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--status-normal)' }}>●</span> Normal
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--status-warning)' }}>●</span> Busy
                            </span>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                <span style={{ color: 'var(--status-critical)' }}>●</span> Critical
                            </span>
                        </div>
                    </div>
                </div>

                {/* Selected Region Details */}
                {selectedRegion && (
                    <div
                        className="region-details p-3 rounded mb-3"
                        style={{
                            backgroundColor: 'var(--bg-input)',
                            border: `1px solid ${getStatusColor(regions[selectedRegion].status)}`
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong style={{ color: 'var(--text-primary)' }}>{regions[selectedRegion].name}</strong>
                            <span
                                className="badge"
                                style={{ backgroundColor: getStatusColor(regions[selectedRegion].status), color: '#fff' }}
                            >
                                {regions[selectedRegion].status.toUpperCase()}
                            </span>
                        </div>
                        <div className="row g-2">
                            <div className="col-4">
                                <small style={{ color: 'var(--text-muted)' }} className="d-block">{t('hospitals')}</small>
                                <strong style={{ color: 'var(--text-primary)' }}>{regions[selectedRegion].hospitals}</strong>
                            </div>
                            <div className="col-4">
                                <small style={{ color: 'var(--text-muted)' }} className="d-block">{t('ambulances')}</small>
                                <strong style={{ color: 'var(--status-normal)' }}>{regions[selectedRegion].ambulances.available}</strong>
                                <small style={{ color: 'var(--text-muted)' }}>/{regions[selectedRegion].ambulances.total}</small>
                            </div>
                            <div className="col-4">
                                <small style={{ color: 'var(--text-muted)' }} className="d-block">{t('activeCases')}</small>
                                <strong style={{ color: 'var(--status-critical)' }}>{regions[selectedRegion].emergencies.active}</strong>
                            </div>
                        </div>
                        <div className="mt-2">
                            <small style={{ color: 'var(--text-muted)' }} className="d-block mb-1">{t('networkLoad')}</small>
                            <div className="progress" style={{ height: '8px', backgroundColor: 'var(--bg-secondary)' }}>
                                <div
                                    className="progress-bar"
                                    style={{
                                        width: `${regions[selectedRegion].load}%`,
                                        backgroundColor: getLoadColor(regions[selectedRegion].load)
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Region Quick Status - Modern Dropdown */}
                <div className="region-status-dropdown mb-3" ref={dropdownRef}>
                    <small style={{ color: 'var(--text-muted)' }} className="d-block mb-2">{t('selectRegion')}</small>
                    <div className="position-relative">
                        {/* Dropdown Trigger */}
                        <div
                            className="dropdown-trigger d-flex align-items-center justify-content-between p-2 rounded"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            style={{
                                backgroundColor: 'var(--bg-input)',
                                border: `2px solid ${selectedRegion ? getStatusColor(regions[selectedRegion].status) : 'var(--border-color)'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <div className="d-flex align-items-center gap-2">
                                {selectedRegion ? (
                                    <>
                                        <span
                                            style={{
                                                width: '10px',
                                                height: '10px',
                                                borderRadius: '50%',
                                                backgroundColor: getStatusColor(regions[selectedRegion].status),
                                                boxShadow: `0 0 8px ${getStatusColor(regions[selectedRegion].status)}50`
                                            }}
                                        />
                                        <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{regions[selectedRegion].city}</span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>• {regions[selectedRegion].ambulances.available}🚑 {t('available')}</span>
                                    </>
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>🌐 {t('allRegions')}</span>
                                )}
                            </div>
                            <span style={{ transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-secondary)' }}>
                                ▼
                            </span>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div
                                className="dropdown-menu-custom position-absolute w-100 mt-1 rounded overflow-hidden"
                                style={{
                                    backgroundColor: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    zIndex: 100,
                                    boxShadow: '0 10px 40px var(--shadow-color)',
                                    animation: 'slideDown 0.2s ease'
                                }}
                            >
                                {/* All Regions Option */}
                                <div
                                    className="dropdown-item-custom d-flex align-items-center gap-2 p-3"
                                    onClick={() => { setSelectedRegion(null); setIsDropdownOpen(false); }}
                                    style={{
                                        cursor: 'pointer',
                                        backgroundColor: !selectedRegion ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                        borderBottom: '1px solid var(--border-color)',
                                        transition: 'background-color 0.15s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = !selectedRegion ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                                >
                                    <span style={{ fontSize: '1.2rem' }}>🌐</span>
                                    <div>
                                        <div className="fw-medium" style={{ color: 'var(--text-primary)' }}>{t('allRegions')}</div>
                                        <small style={{ color: 'var(--text-muted)' }}>{t('networkOverview')}</small>
                                    </div>
                                </div>

                                {/* Region Options */}
                                {Object.entries(regions).map(([key, region]) => (
                                    <div
                                        key={key}
                                        className="dropdown-item-custom d-flex align-items-center gap-3 p-3"
                                        onClick={() => { setSelectedRegion(key); setIsDropdownOpen(false); }}
                                        style={{
                                            cursor: 'pointer',
                                            backgroundColor: selectedRegion === key ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                                            borderBottom: '1px solid var(--border-color)',
                                            transition: 'background-color 0.15s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedRegion === key ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
                                    >
                                        <div
                                            style={{
                                                width: '12px',
                                                height: '12px',
                                                borderRadius: '50%',
                                                backgroundColor: getStatusColor(region.status),
                                                boxShadow: `0 0 8px ${getStatusColor(region.status)}50`,
                                                flexShrink: 0
                                            }}
                                        />
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="fw-medium" style={{ color: 'var(--text-primary)' }}>{region.city}</span>
                                                <span className="badge" style={{
                                                    backgroundColor: getStatusColor(region.status),
                                                    fontSize: '0.65rem',
                                                    color: '#fff'
                                                }}>
                                                    {region.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <div className="d-flex gap-3 mt-1">
                                                <small style={{ color: 'var(--text-muted)' }}>🏥 {region.hospitals}</small>
                                                <small style={{ color: 'var(--text-muted)' }}>🚑 {region.ambulances.available}/{region.ambulances.total}</small>
                                                <small style={{ color: 'var(--text-muted)' }}>📊 {region.load}%</small>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <style>{`
                        @keyframes slideDown {
                            from { opacity: 0; transform: translateY(-10px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                        .dropdown-trigger:hover {
                            background-color: var(--bg-card-hover) !important;
                        }
                    `}</style>
                </div>

                {/* Event Log */}
                <div className="event-log">
                    <small style={{ color: 'var(--text-muted)' }} className="d-block mb-2">{t('networkActivity')}</small>
                    <div style={{ maxHeight: '80px', overflowY: 'auto' }}>
                        {eventLog.slice(-5).reverse().map((event, idx) => (
                            <div key={idx} className="d-flex align-items-center mb-1">
                                <small style={{ color: 'var(--text-muted)', width: '55px' }} className="me-2">
                                    {event.time}
                                </small>
                                <span className="me-2">
                                    {event.type === 'emergency' ? '🚨' : '🔄'}
                                </span>
                                <small style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{event.event}</small>
                            </div>
                        ))}
                        {eventLog.length === 0 && (
                            <small style={{ color: 'var(--text-muted)' }}>Monitoring network activity...</small>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default NationalEmergencyNetworkCard;
