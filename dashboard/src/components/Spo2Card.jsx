/**
 * LifeLink Twin - SpO2 Card Component
 * 
 * Displays blood oxygen saturation with large numeric display
 * and a Bootstrap progress bar indicator.
 */

import { useLanguage } from '../i18n';

function Spo2Card({ value, status }) {
    const { t } = useLanguage();

    // Calculate progress percentage (85-100% range)
    const progressPercent = value != null ? Math.max(0, Math.min(100, ((value - 85) / 15) * 100)) : 0;

    // Determine colors based on value
    const getProgressColor = () => {
        if (value == null) return 'bg-secondary';
        if (value < 90) return 'bg-danger';
        if (value < 94) return 'bg-warning';
        return 'bg-success';
    };

    const getCardClass = () => {
        if (value == null) return '';
        if (value < 90) return 'glow-critical';
        if (value < 94) return 'glow-warning';
        return '';
    };

    const getStatusText = () => {
        if (value == null) return { text: `${t('waiting')}...`, class: 'text-muted' };
        if (value < 90) return { text: `${t('critical')} - Hypoxemia`, class: 'text-danger' };
        if (value < 94) return { text: 'Low Oxygen', class: 'text-warning' };
        return { text: t('normal'), class: 'text-success' };
    };

    const statusInfo = getStatusText();

    return (
        <div className={`card vital-card ${getCardClass()}`}>
            <div className="card-body">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="vital-header">
                        <span className="vital-icon">🫁</span>
                        <span className="vital-title">{t('spo2')}</span>
                    </div>
                    <span className="badge" style={{ backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>SpO₂</span>
                </div>

                {/* Large Value Display */}
                <div className="vital-value-container text-center my-4">
                    <span className="vital-value spo2-value">{value || '--'}</span>
                    <span className="vital-unit">%</span>
                </div>

                {/* Status */}
                <div className={`text-center mb-3 ${statusInfo.class}`}>
                    <small>{statusInfo.text}</small>
                </div>

                {/* Progress Bar */}
                <div className="spo2-gauge">
                    <div className="progress" style={{ height: '20px', backgroundColor: 'var(--bg-input)', border: '1px solid var(--border-color)' }}>
                        <div
                            className={`progress-bar ${getProgressColor()}`}
                            role="progressbar"
                            style={{
                                width: `${progressPercent}%`,
                                transition: 'width 0.5s ease'
                            }}
                        />
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">85%</small>
                        <small className="text-muted">100%</small>
                    </div>
                </div>

                {/* Range indicators */}
                <div className="range-legend mt-3 d-flex justify-content-center gap-3">
                    <span className="legend-item">
                        <span className="legend-dot bg-danger"></span>
                        <small>&lt;90</small>
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot bg-warning"></span>
                        <small>90-94</small>
                    </span>
                    <span className="legend-item">
                        <span className="legend-dot bg-success"></span>
                        <small>&gt;94</small>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default Spo2Card;
