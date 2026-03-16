import { useEffect, useMemo, useState } from 'react';

function readCssVar(name, fallback = '') {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(name);
    return (value || fallback).trim();
}

function parseRgbTuple(color) {
    const match = color
        .replace(/\s+/g, '')
        .match(/^rgba?\((\d+),(\d+),(\d+)(?:,(\d*\.?\d+))?\)$/i);
    if (!match) return null;
    return {
        r: Number(match[1]),
        g: Number(match[2]),
        b: Number(match[3]),
        a: match[4] == null ? 1 : Number(match[4]),
    };
}

function hexToRgb(hex) {
    const normalized = hex.replace('#', '').trim();
    if (![3, 6].includes(normalized.length)) return null;

    const full = normalized.length === 3
        ? normalized.split('').map((ch) => ch + ch).join('')
        : normalized;

    const num = Number.parseInt(full, 16);
    if (Number.isNaN(num)) return null;

    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
    };
}

export function withAlpha(color, alpha) {
    if (!color) return color;
    const trimmed = String(color).trim();

    if (trimmed.startsWith('#')) {
        const rgb = hexToRgb(trimmed);
        if (!rgb) return trimmed;
        return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
    }

    const rgbTuple = parseRgbTuple(trimmed);
    if (rgbTuple) {
        return `rgba(${rgbTuple.r}, ${rgbTuple.g}, ${rgbTuple.b}, ${alpha})`;
    }

    return trimmed;
}

export function readChartThemeVars() {
    const border = readCssVar('--border-color', 'rgba(148, 163, 184, 0.20)');
    const textPrimary = readCssVar('--text-primary', '#ffffff');
    const textSecondary = readCssVar('--text-secondary', '#8b949e');
    const bgCard = readCssVar('--bg-card', 'rgba(15, 23, 42, 0.92)');

    const heart = readCssVar('--heart-color', '#ff6b6b');
    const spo2 = readCssVar('--spo2-color', '#3b82f6');
    const temp = readCssVar('--temp-color', '#fbbf24');

    return {
        textPrimary,
        textSecondary,
        border,
        grid: withAlpha(border, 0.55),
        tooltipBg: withAlpha(bgCard, 0.98),
        tooltipBorder: withAlpha(border, 0.9),
        heart,
        spo2,
        temp,
    };
}

export function useChartTheme() {
    const [vars, setVars] = useState(() => readChartThemeVars());

    useEffect(() => {
        if (typeof document === 'undefined') return undefined;

        const apply = () => setVars(readChartThemeVars());

        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
                    apply();
                    break;
                }
            }
        });

        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

        // Catch any late theme application on mount
        apply();

        return () => observer.disconnect();
    }, []);

    return vars;
}

export function buildLineChartOptions(themeVars, { min, max, showLegend = false, title } = {}) {
    const titleText = title || '';

    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: showLegend
                ? {
                    display: true,
                    position: 'top',
                    labels: {
                        color: themeVars.textSecondary,
                        usePointStyle: true,
                        boxWidth: 8,
                        boxHeight: 8,
                    },
                }
                : { display: false },
            title: titleText
                ? {
                    display: true,
                    text: titleText,
                    color: themeVars.textPrimary,
                    font: { size: 14, weight: '600' },
                }
                : { display: false },
            tooltip: {
                backgroundColor: themeVars.tooltipBg,
                borderColor: themeVars.tooltipBorder,
                borderWidth: 1,
                titleColor: themeVars.textPrimary,
                bodyColor: themeVars.textPrimary,
                displayColors: true,
                padding: 10,
                boxPadding: 4,
            },
        },
        scales: {
            x: {
                display: true,
                grid: { color: themeVars.grid },
                ticks: { color: themeVars.textSecondary, maxTicksLimit: 10 },
            },
            y: {
                min,
                max,
                grid: { color: themeVars.grid },
                ticks: { color: themeVars.textSecondary },
            },
        },
        animation: { duration: 350 },
    };
}
