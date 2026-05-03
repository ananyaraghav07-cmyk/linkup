/**
 * LifeLink Twin - Navbar Component
 * 
 * Top navigation bar with hamburger menu toggle,
 * connection status, theme toggle, language selector, patient selector, and current time display.
 * Pan India multi-language support.
 * Doctor-only dashboard.
 */

import { useMemo, useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n';
import { getRoleDisplayName, getRoleIcon } from '../utils/rbac';

// Language configurations with native names
const LANGUAGES = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', flag: '🇮🇳' },
    { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
    { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
    { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', flag: '🇮🇳' },
];

function Navbar({
    connected,
    status,
    onMenuToggle,
    sidebarOpen,
    simulatorOn,
    onToggleSimulator,
    theme,
    onToggleTheme,
    notifications,
    onOpenNotifications,
    patients,
    selectedPatientId,
    onSelectPatient,
    allPatientsData,
    user,
    onLogout
}) {
    // Language context
    const { language, changeLanguage, t } = useLanguage();

    const [time, setTime] = useState(new Date().toLocaleTimeString());
    const [date, setDate] = useState(new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
    }));

    // Language dropdown state
    const [langDropdownOpen, setLangDropdownOpen] = useState(false);
    const [langSearch, setLangSearch] = useState('');
    const langDropdownRef = useRef(null);

    const unreadCount = useMemo(() => (notifications || []).filter(n => !n.read).length, [notifications]);

    // Get current language
    const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

    // Filter languages based on search
    const filteredLanguages = LANGUAGES.filter(lang =>
        lang.name.toLowerCase().includes(langSearch.toLowerCase()) ||
        lang.nativeName.toLowerCase().includes(langSearch.toLowerCase())
    );

    // Show only 5 results at a time
    const displayedLanguages = filteredLanguages.slice(0, 5);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
                setLangDropdownOpen(false);
                setLangSearch('');
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const getStatusBadgeClass = () => {
        switch (status) {
            case 'critical': return 'badge-critical';
            case 'warning': return 'badge-warning';
            default: return 'badge-normal';
        }
    };

    // Get status indicator for each patient
    const getPatientStatusDot = (patientId) => {
        const data = allPatientsData?.[patientId];
        if (!data) return '⚪';
        switch (data.status) {
            case 'critical': return '🔴';
            case 'warning': return '🟡';
            default: return '🟢';
        }
    };

    const handleLanguageSelect = (langCode) => {
        changeLanguage(langCode);
        setLangDropdownOpen(false);
        setLangSearch('');
    };

    const selectedPatientDot = selectedPatientId ? getPatientStatusDot(selectedPatientId) : '👤';

    return (
        <nav className="top-navbar">
            <div className="navbar-left">
                {/* Menu button (mobile header collapse) */}
                <button
                    className={`hamburger-btn ${sidebarOpen ? 'active' : ''}`}
                    onClick={onMenuToggle}
                    aria-label="Toggle menu"
                >
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                    <span className="hamburger-line"></span>
                </button>

                {/* Logo + Title (mobile) */}
                <div className="navbar-title d-lg-none">
                    <span className="title-icon">🏥</span>
                    <span className="title-text">Linkup</span>
                </div>

                {/* Breadcrumb - visible on desktop */}
                <div className="navbar-breadcrumb d-none d-lg-flex">
                    <span className="breadcrumb-item">{t('dashboard')}</span>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-item active">{t('liveMonitor')}</span>
                </div>
            </div>

            <div className="navbar-right">
                {/* Patient Selector Dropdown */}
                {simulatorOn && patients && patients.length > 0 && (
                    <div className="patient-selector me-2 d-flex align-items-center" style={{ gap: '8px' }}>
                        <span className="d-none d-md-inline" style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
                            👤 Patient
                        </span>
                        <div className="position-relative">
                            <span
                                aria-hidden
                                style={{
                                    position: 'absolute',
                                    left: '10px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {selectedPatientDot}
                            </span>
                            <select
                                className="form-select form-select-sm patient-dropdown ll-control"
                                value={selectedPatientId}
                                onChange={(e) => onSelectPatient(e.target.value)}
                                style={{
                                    minWidth: '240px',
                                    paddingLeft: '32px'
                                }}
                            >
                                {patients.map(patient => (
                                    <option key={patient.id} value={patient.id}>
                                        {getPatientStatusDot(patient.id)} {patient.name} ({patient.ambulance})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Language Selector Dropdown (desktop/tablet) */}
                <div className="language-selector me-2 d-none d-sm-block" ref={langDropdownRef}>
                    <button
                        className={`lang-trigger-btn d-flex align-items-center gap-2 ${langDropdownOpen ? 'open' : ''}`}
                        onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                    >
                        <span>🌐</span>
                        <span className="d-none d-md-inline">{currentLang.nativeName}</span>
                        <span className="lang-caret">▼</span>
                    </button>

                    {langDropdownOpen && (
                        <div
                            className="lang-dropdown-menu"
                        >
                            {/* Search Input */}
                            <div className="lang-dropdown-header">
                                <input
                                    type="text"
                                    className="form-control ll-control lang-search"
                                    placeholder={`🔍 ${t('searchLanguage')}`}
                                    value={langSearch}
                                    onChange={(e) => setLangSearch(e.target.value)}
                                    autoFocus
                                />
                                <small className="lang-hint">
                                    {filteredLanguages.length} {t('languagesFound')}
                                </small>
                            </div>

                            {/* Language List - Max 5 visible */}
                            <div className="lang-dropdown-list">
                                {displayedLanguages.length > 0 ? (
                                    displayedLanguages.map(lang => (
                                        <div
                                            key={lang.code}
                                            onClick={() => handleLanguageSelect(lang.code)}
                                            className={`lang-item ${lang.code === language ? 'active' : ''}`}
                                        >
                                            <span className="lang-flag">{lang.flag}</span>
                                            <div className="lang-text">
                                                <div className="lang-native">{lang.nativeName}</div>
                                                <small className="lang-name">{lang.name}</small>
                                            </div>
                                            {lang.code === language && (
                                                <span className="lang-check">✓</span>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="lang-empty">
                                        No languages found
                                    </div>
                                )}

                                {filteredLanguages.length > 5 && (
                                    <div className="lang-footer">
                                        +{filteredLanguages.length - 5} more • Type to search
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Theme Toggle */}
                <button
                    className="theme-toggle-btn"
                    onClick={onToggleTheme}
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* Simulator Toggle */}
                <div className="simulator-toggle d-flex align-items-center gap-2 me-3">
                    <span className="d-none d-md-inline text-muted" style={{ fontSize: '0.75rem' }}>
                        🎮 Simulator
                    </span>
                    <button
                        className={`btn btn-sm ${simulatorOn ? 'btn-success' : 'btn-outline-secondary'}`}
                        onClick={onToggleSimulator}
                        style={{
                            minWidth: '60px',
                            fontSize: '0.7rem',
                            padding: '4px 10px',
                            fontWeight: 'bold'
                        }}
                    >
                        {simulatorOn ? '🟢 ON' : '⚫ OFF'}
                    </button>
                </div>

                {/* Patient Status */}
                <div className={`status-badge ${getStatusBadgeClass()}`}>
                    <span className="status-dot"></span>
                    <span className="status-text d-none d-sm-inline text-uppercase fw-bold">
                        {status || 'WAITING'}
                    </span>
                </div>

                {/* Connection Status */}
                <div className={`connection-indicator ${connected ? 'connected' : 'disconnected'}`}>
                    <span className="indicator-dot"></span>
                    <span className="d-none d-md-inline">{connected ? 'LIVE' : 'OFFLINE'}</span>
                </div>

                {/* Date & Time */}
                <div className="datetime-display d-none d-sm-flex">
                    <span className="date-text">{date}</span>
                    <span className="time-text">{time}</span>
                </div>

                {/* Notifications (opens shared drawer) */}
                <button
                    type="button"
                    className="notification-btn"
                    onClick={onOpenNotifications}
                    aria-label="Open notifications"
                >
                    <span className="notification-icon">🔔</span>
                    {unreadCount > 0 && (
                        <span className="notification-badge">{unreadCount}</span>
                    )}
                </button>

                {/* User Menu with Logout */}
                <div className="user-menu">
                    <div className="user-info d-none d-md-flex">
                        <span className="user-name">{user?.name || 'User'}</span>
                        <span className="user-role">{getRoleDisplayName(user?.role) || 'Guest'}</span>
                    </div>
                    <div className="user-avatar">
                        <span>{getRoleIcon(user?.role)}</span>
                    </div>
                    <button className="logout-btn" onClick={onLogout} title="Logout">
                        <span>🚪</span>
                        <span className="d-none d-sm-inline">Logout</span>
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
