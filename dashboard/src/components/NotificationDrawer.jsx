/**
 * Notifications drawer.
 * Desktop: right-side floating panel
 * Mobile: slide drawer with overlay
 */

import Drawer from './Drawer';

function NotificationDrawer({ open, onClose, notifications, onMarkAsRead, onMarkAllAsRead, onClear }) {
    const unreadCount = (notifications || []).filter((n) => !n.read).length;

    return (
        <Drawer
            open={open}
            onClose={onClose}
            title={`Notifications${unreadCount ? ` (${unreadCount})` : ''}`}
            side="right"
            widthClassName="w-[320px] sm:w-[360px]"
        >
            <div className="flex items-center justify-between mb-3" style={{ gap: '12px' }}>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-light"
                    onClick={onMarkAllAsRead}
                    disabled={!unreadCount}
                >
                    Mark all read
                </button>
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={onClose}>
                    Close
                </button>
            </div>

            <div className="space-y-3">
                {(notifications || []).length === 0 && (
                    <div className="text-muted">No notifications.</div>
                )}

                {(notifications || []).map((n) => (
                    <div
                        key={n.id}
                        className="p-3 rounded border"
                        style={{
                            background: 'var(--bg-card)',
                            borderColor: 'var(--border-color)',
                            overflow: 'hidden',
                        }}
                    >
                        <div className="d-flex justify-content-between align-items-start" style={{ gap: '12px' }}>
                            <div style={{ minWidth: 0 }}>
                                <div className="fw-semibold" style={{ color: 'var(--text-primary)' }}>
                                    {n.title}
                                    {!n.read && <span className="ms-2 badge bg-danger">NEW</span>}
                                </div>
                                <div className="small" style={{ color: 'var(--text-secondary)' }}>
                                    {n.message}
                                </div>
                                <div className="small mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {n.time}
                                </div>
                            </div>

                            <div className="d-flex flex-column" style={{ gap: '8px', flex: '0 0 auto' }}>
                                {!n.read && (
                                    <button type="button" className="btn btn-sm btn-primary" onClick={() => onMarkAsRead?.(n.id)}>
                                        Read
                                    </button>
                                )}
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => onClear?.(n.id)}>
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Drawer>
    );
}

export default NotificationDrawer;
