export const textColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--text-color')
    .trim();

export const backgroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--background-color')
    .trim();

export const foregroundColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--foreground-color')
    .trim();

export const primaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-color')
    .trim();

export const secondaryColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--secondary-color')
    .trim();