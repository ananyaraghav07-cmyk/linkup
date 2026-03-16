/**
 * LifeLink Twin - Ambulance Tracker Card Component
 * 
 * Live ambulance tracking with simulated GPS, ETA, and traffic information.
 * Uses Google Maps embed for visualization.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import DashboardCard from './DashboardCard';

function AmbulanceTrackerCard() {
    // Ambulance state
    const [ambulanceData, setAmbulanceData] = useState({
        id: 'AMB-4521',
        driver: 'Mike Johnson',
        status: 'en-route', // 'dispatched', 'en-route', 'arriving', 'on-scene'
        speed: 0,
        eta: 0,
        distance: 0,
        progress: 0
    });

    // Locations (Hospital = destination)
    const [locations] = useState({
        hospital: { lat: 28.6139, lng: 77.2090, name: 'City General Hospital' }, // Delhi coordinates
        ambulance: { lat: 28.5355, lng: 77.3910, name: 'Current Location' }, // Noida
        patient: { lat: 28.4595, lng: 77.0266, name: 'Patient Location' } // Gurgaon
    });

    // Traffic conditions
    const [traffic, setTraffic] = useState({
        condition: 'moderate', // 'light', 'moderate', 'heavy'
        delay: 0,
        incidents: []
    });

    // Simulation state
    const [isSimulating, setIsSimulating] = useState(false);
    const simulationRef = useRef(null);
    const [currentPosition, setCurrentPosition] = useState({ lat: 28.5355, lng: 77.3910 });

    // Route waypoints for simulation
    const routeWaypoints = [
        { lat: 28.5355, lng: 77.3910 },
        { lat: 28.5500, lng: 77.3500 },
        { lat: 28.5700, lng: 77.3000 },
        { lat: 28.5900, lng: 77.2500 },
        { lat: 28.6000, lng: 77.2300 },
        { lat: 28.6139, lng: 77.2090 }
    ];
    const [waypointIndex, setWaypointIndex] = useState(0);

    // Calculate ETA based on distance and traffic
    const calculateETA = useCallback((distance, trafficCondition) => {
        const baseSpeed = 40; // km/h average
        const trafficMultiplier = {
            'light': 1.0,
            'moderate': 1.3,
            'heavy': 1.8
        };
        const effectiveSpeed = baseSpeed / trafficMultiplier[trafficCondition];
        return Math.round((distance / effectiveSpeed) * 60); // minutes
    }, []);

    // Start simulation
    const startSimulation = () => {
        setIsSimulating(true);
        setWaypointIndex(0);
        setCurrentPosition(routeWaypoints[0]);
        setAmbulanceData(prev => ({
            ...prev,
            status: 'en-route',
            distance: 15.5,
            progress: 0
        }));

        // Randomize traffic
        const conditions = ['light', 'moderate', 'heavy'];
        const randomTraffic = conditions[Math.floor(Math.random() * conditions.length)];
        setTraffic({
            condition: randomTraffic,
            delay: randomTraffic === 'heavy' ? 8 : randomTraffic === 'moderate' ? 3 : 0,
            incidents: randomTraffic === 'heavy' ? ['Road work ahead on NH-44', 'Accident reported near sector 62'] :
                randomTraffic === 'moderate' ? ['Heavy traffic at toll plaza'] : []
        });
    };

    // Stop simulation
    const stopSimulation = () => {
        setIsSimulating(false);
        if (simulationRef.current) {
            clearInterval(simulationRef.current);
        }
    };

    // Simulation effect
    useEffect(() => {
        if (isSimulating) {
            simulationRef.current = setInterval(() => {
                setWaypointIndex(prev => {
                    const nextIndex = prev + 1;
                    if (nextIndex >= routeWaypoints.length) {
                        setIsSimulating(false);
                        setAmbulanceData(data => ({
                            ...data,
                            status: 'on-scene',
                            eta: 0,
                            distance: 0,
                            progress: 100
                        }));
                        return prev;
                    }

                    // Update position
                    setCurrentPosition(routeWaypoints[nextIndex]);

                    // Update ambulance data
                    const progress = Math.round((nextIndex / (routeWaypoints.length - 1)) * 100);
                    const remainingDistance = 15.5 * (1 - progress / 100);

                    setAmbulanceData(data => ({
                        ...data,
                        progress,
                        distance: remainingDistance.toFixed(1),
                        speed: Math.round(30 + Math.random() * 40),
                        eta: calculateETA(remainingDistance, traffic.condition),
                        status: progress > 80 ? 'arriving' : 'en-route'
                    }));

                    return nextIndex;
                });
            }, 2000); // Update every 2 seconds
        }

        return () => {
            if (simulationRef.current) {
                clearInterval(simulationRef.current);
            }
        };
    }, [isSimulating, traffic.condition, calculateETA]);

    // Initial ETA calculation
    useEffect(() => {
        const initialETA = calculateETA(15.5, traffic.condition);
        setAmbulanceData(prev => ({ ...prev, eta: initialETA, distance: 15.5 }));
    }, [calculateETA, traffic.condition]);

    const getStatusColor = () => {
        switch (ambulanceData.status) {
            case 'on-scene': return 'success';
            case 'arriving': return 'warning';
            case 'en-route': return 'primary';
            default: return 'secondary';
        }
    };

    const getTrafficColor = () => {
        switch (traffic.condition) {
            case 'light': return 'success';
            case 'moderate': return 'warning';
            case 'heavy': return 'danger';
            default: return 'secondary';
        }
    };

    return (
        <DashboardCard
            icon="🚑"
            title="Live Ambulance Tracker"
            headerRight={(
                <div className="d-flex" style={{ gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                    {!isSimulating ? (
                        <button className="btn btn-sm btn-primary" onClick={startSimulation}>
                            ▶️ Start Simulation
                        </button>
                    ) : (
                        <button className="btn btn-sm btn-danger" onClick={stopSimulation}>
                            ⏹️ Stop
                        </button>
                    )}
                    <span className={`badge bg-${getStatusColor()}`}>
                        {ambulanceData.status.toUpperCase().replace('-', ' ')}
                    </span>
                </div>
            )}
            className="ambulance-tracker-card"
        >

                <div className="row g-3">
                    {/* Map Section */}
                    <div className="col-12 col-lg-8">
                        <div className="map-container" style={{
                            height: '300px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            background: 'var(--bg-input)',
                            position: 'relative'
                        }}>
                            {/* Simulated Map View */}
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-input) 100%)',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                position: 'relative'
                            }}>
                                {/* Map Grid Background */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    backgroundImage: `
                                        linear-gradient(var(--border-color) 1px, transparent 1px),
                                        linear-gradient(90deg, var(--border-color) 1px, transparent 1px)
                                    `,
                                    backgroundSize: '30px 30px'
                                }}></div>

                                {/* Route Line */}
                                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
                                    <defs>
                                        <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="var(--accent-cyan)" />
                                            <stop offset="100%" stopColor="var(--accent-blue)" />
                                        </linearGradient>
                                    </defs>
                                    <path
                                        d="M 50,250 Q 150,200 200,150 T 350,100 T 550,50"
                                        stroke="url(#routeGradient)"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray="10,5"
                                        opacity="0.6"
                                    />
                                    <path
                                        d="M 50,250 Q 150,200 200,150 T 350,100 T 550,50"
                                        stroke="var(--accent-cyan)"
                                        strokeWidth="4"
                                        fill="none"
                                        strokeDasharray={`${ambulanceData.progress * 6}, 1000`}
                                    />
                                </svg>

                                {/* Hospital Marker */}
                                <div style={{
                                    position: 'absolute',
                                    top: '40px',
                                    right: '50px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '2rem' }}>🏥</div>
                                    <small style={{ color: 'var(--status-normal)' }}>Hospital</small>
                                </div>

                                {/* Ambulance Marker (animated) */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: `${40 + ambulanceData.progress * 1.8}px`,
                                    left: `${50 + ambulanceData.progress * 4.5}px`,
                                    textAlign: 'center',
                                    transition: 'all 0.5s ease',
                                    animation: 'pulse 1s infinite'
                                }}>
                                    <div style={{
                                        fontSize: '2.5rem',
                                        filter: 'drop-shadow(0 0 12px var(--status-critical))'
                                    }}>🚑</div>
                                    <div className="badge bg-danger">{ambulanceData.id}</div>
                                </div>

                                {/* Patient Location Marker */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '30px',
                                    left: '40px',
                                    textAlign: 'center'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>📍</div>
                                    <small style={{ color: 'var(--accent-cyan)' }}>Pickup</small>
                                </div>

                                {/* ETA Overlay */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    left: '15px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    padding: '10px 15px',
                                    borderRadius: '8px'
                                }}>
                                    <div className="fw-bold" style={{ fontSize: '1.5rem', color: 'var(--accent-cyan)' }}>
                                        {ambulanceData.status === 'on-scene' ? 'ARRIVED' : `${ambulanceData.eta} min`}
                                    </div>
                                    <small style={{ color: 'var(--text-muted)' }}>ETA to Hospital</small>
                                </div>

                                {/* Traffic Badge */}
                                <div style={{
                                    position: 'absolute',
                                    top: '15px',
                                    right: '15px',
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    padding: '8px 12px',
                                    borderRadius: '8px'
                                }}>
                                    <span className={`badge bg-${getTrafficColor()}`}>
                                        🚦 {traffic.condition.toUpperCase()} TRAFFIC
                                    </span>
                                </div>

                                {/* Link to open in Google Maps */}
                                <a
                                    href={`https://www.google.com/maps/dir/${currentPosition.lat},${currentPosition.lng}/${locations.hospital.lat},${locations.hospital.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-sm"
                                    style={{
                                        position: 'absolute',
                                        bottom: '15px',
                                        right: '15px',
                                        background: 'var(--bg-input)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    🗺️ Open in Google Maps
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Info Panel */}
                    <div className="col-12 col-lg-4">
                        {/* Progress */}
                        <div className="mb-3">
                            <div className="d-flex justify-content-between mb-2">
                                <small style={{ color: 'var(--text-muted)' }}>Journey Progress</small>
                                <small style={{ color: 'var(--text-secondary)' }}>{ambulanceData.progress}%</small>
                            </div>
                            <div className="progress" style={{ height: '8px', backgroundColor: 'var(--bg-input)' }}>
                                <div
                                    className={`progress-bar bg-${getStatusColor()}`}
                                    style={{ width: `${ambulanceData.progress}%`, transition: 'width 0.5s ease' }}
                                />
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="row g-2 mb-3">
                            <div className="col-6">
                                <div className="stat-box p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                    <small className="d-block" style={{ color: 'var(--text-muted)' }}>Distance</small>
                                    <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{ambulanceData.distance} km</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-box p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                    <small className="d-block" style={{ color: 'var(--text-muted)' }}>Speed</small>
                                    <span className="fw-bold" style={{ color: 'var(--text-primary)' }}>{ambulanceData.speed} km/h</span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-box p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                    <small className="d-block" style={{ color: 'var(--text-muted)' }}>ETA</small>
                                    <span className="fw-bold" style={{ color: 'var(--accent-cyan)' }}>
                                        {ambulanceData.status === 'on-scene' ? 'Arrived' : `${ambulanceData.eta} min`}
                                    </span>
                                </div>
                            </div>
                            <div className="col-6">
                                <div className="stat-box p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                    <small className="d-block" style={{ color: 'var(--text-muted)' }}>Traffic Delay</small>
                                    <span className={`text-${getTrafficColor()} fw-bold`}>+{traffic.delay} min</span>
                                </div>
                            </div>
                        </div>

                        {/* Ambulance Details */}
                        <div className="ambulance-details p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{ color: 'var(--text-muted)' }}>Unit</span>
                                <span className="badge bg-danger">{ambulanceData.id}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <span style={{ color: 'var(--text-muted)' }}>Driver</span>
                                <span style={{ color: 'var(--text-primary)' }}>{ambulanceData.driver}</span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                                <span style={{ color: 'var(--text-muted)' }}>Destination</span>
                                <span style={{ color: 'var(--text-primary)' }}>{locations.hospital.name}</span>
                            </div>
                        </div>

                        {/* Traffic Incidents */}
                        {traffic.incidents.length > 0 && (
                            <div className="mt-3 p-2 rounded" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                                <small className="text-warning d-block mb-2">⚠️ Traffic Incidents:</small>
                                {traffic.incidents.map((incident, i) => (
                                    <small key={i} style={{ color: 'var(--text-muted)' }} className="d-block">• {incident}</small>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }
            `}</style>
        </DashboardCard>
    );
}

export default AmbulanceTrackerCard;
