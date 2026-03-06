/**
 * Standard dashboard card shell.
 * Unifies padding, header layout, and overflow behavior across widgets.
 */

function DashboardCard({
    icon,
    title,
    headerRight,
    footer,
    children,
    className = '',
    bodyClassName = '',
}) {
    return (
        <div className={`card vital-card ${className}`}>
            <div className={`card-body ${bodyClassName}`}>
                {(icon || title || headerRight) && (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="vital-header">
                            {icon && <span className="vital-icon">{icon}</span>}
                            {title && <span className="vital-title">{title}</span>}
                        </div>
                        {headerRight}
                    </div>
                )}

                <div style={{ minWidth: 0 }}>{children}</div>

                {footer && <div className="mt-3">{footer}</div>}
            </div>
        </div>
    );
}

export default DashboardCard;
