/**
 * Design Tokens
 * 
 * TypeScript constants for programmatic access to design tokens.
 * These values should match the CSS custom properties defined in index.css
 */

export const designTokens = {
  colors: {
    primary: 'var(--primary)',
    primaryHover: 'var(--primary-hover)',
    primaryActive: 'var(--primary-active)',
    primaryForeground: 'var(--primary-foreground)',
    secondary: 'var(--secondary)',
    secondaryHover: 'var(--secondary-hover)',
    secondaryActive: 'var(--secondary-active)',
    secondaryForeground: 'var(--secondary-foreground)',
    success: 'var(--success)',
    successForeground: 'var(--success-foreground)',
    warning: 'var(--warning)',
    warningForeground: 'var(--warning-foreground)',
    error: 'var(--error)',
    errorForeground: 'var(--error-foreground)',
    info: 'var(--info)',
    infoForeground: 'var(--info-foreground)',
    background: 'var(--background)',
    surface: 'var(--surface)',
    surfaceElevated: 'var(--surface-elevated)',
    foreground: 'var(--foreground)',
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)',
    mutedSubtle: 'var(--muted-subtle)',
    border: 'var(--border)',
    borderStrong: 'var(--border-strong)',
    borderSubtle: 'var(--border-subtle)',
    disabled: 'var(--disabled)',
    disabledForeground: 'var(--disabled-foreground)',
  },
  
  typography: {
    h1: 'var(--font-h1)',
    h2: 'var(--font-h2)',
    h3: 'var(--font-h3)',
    h4: 'var(--font-h4)',
    h5: 'var(--font-h5)',
    h6: 'var(--font-h6)',
    body: 'var(--font-body)',
    small: 'var(--font-small)',
    caption: 'var(--font-caption)',
  },
  
  spacing: {
    0: 'var(--spacing-0)',
    1: 'var(--spacing-1)',
    2: 'var(--spacing-2)',
    3: 'var(--spacing-3)',
    4: 'var(--spacing-4)',
    5: 'var(--spacing-5)',
    6: 'var(--spacing-6)',
    8: 'var(--spacing-8)',
    10: 'var(--spacing-10)',
    12: 'var(--spacing-12)',
    16: 'var(--spacing-16)',
  },
  
  borderRadius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    lg: 'var(--radius-lg)',
    xl: 'var(--radius-xl)',
  },
  
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  
  duration: {
    fast: 'var(--duration-fast)',
    normal: 'var(--duration-normal)',
    slow: 'var(--duration-slow)',
  },
} as const;

export default designTokens;

