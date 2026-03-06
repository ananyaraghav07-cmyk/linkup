/**
 * Generic slide-in drawer.
 * - overlay background
 * - closes on outside click / Escape
 * - prevents layout shift by using fixed positioning
 */

import { useEffect } from 'react';

function Drawer({
    open,
    onClose,
    title,
    side = 'right',
    widthClassName = 'w-[320px] sm:w-[360px]',
    children,
    zIndexClassName = 'z-[1200]',
}) {
    useEffect(() => {
        if (!open) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        document.addEventListener('keydown', onKeyDown);
        return () => document.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    const isRight = side === 'right';

    return (
        <div className={`fixed inset-0 ${zIndexClassName}`} aria-modal="true" role="dialog">
            <button
                type="button"
                className="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-[2px]"
                aria-label="Close"
                onClick={onClose}
            />

            <div
                className={
                    `absolute top-0 h-full ${widthClassName} ` +
                    (isRight ? 'right-0' : 'left-0') +
                    ' bg-[var(--bg-sidebar)] border-l border-[var(--border-color)]'
                }
                style={{
                    transform: 'translateX(0)',
                    transition: 'transform 200ms ease',
                }}
            >
                <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)]">
                        <div className="font-semibold text-[clamp(14px,1.2vw,18px)] text-[var(--text-primary)]">
                            {title}
                        </div>
                        <button
                            type="button"
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                            onClick={onClose}
                            aria-label="Close drawer"
                            style={{ background: 'transparent', border: 'none', padding: '6px' }}
                        >
                            ✕
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Drawer;
