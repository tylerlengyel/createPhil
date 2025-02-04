// /utils/colorUtils.js

/**
 * Utility functions for color manipulation and generation
 */

export function hslToRgb(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return `rgb(${Math.round(f(0) * 255)}, ${Math.round(f(8) * 255)}, ${Math.round(f(4) * 255)})`;
}

export function generateSecureRandomHexColor() {
    const array = new Uint8Array(3);
    window.crypto.getRandomValues(array);
    return `#${Array.from(array)
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")}`;
}

export function getSecureRandomNumber() {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] / (0xFFFFFFFF + 1);
}