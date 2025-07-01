export const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-color')
    .trim();

export const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color')
    .trim();

export const foregroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--foreground-color')
    .trim();

export const accentColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-color')
    .trim();