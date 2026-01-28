/**
 * Design Tokens
 * 
 * TypeScript constants for programmatic access to design tokens.
 * These values should match the CSS custom properties defined in index.css
 */

export const designTokens = {
  colors: {
    // Brand Colors - LIGHT Palette
    brandInk: 'var(--brand-ink)', // Legacy - use primary scale
    brandAquaTeal: 'var(--brand-aqua-teal)', // Legacy - use primary scale
    brandSoftMint: 'var(--brand-soft-mint)', // Legacy - use primary scale
    brandSuccessLime: 'var(--brand-success-lime)', // Legacy - use success
    brandHighlightLime: 'var(--brand-highlight-lime)', // Legacy - use warning
    brandMutedSlate: 'var(--brand-muted-slate)', // Legacy - use muted colors
    
    // Brand Scale (50-900 based on #008100 - Green)
    brand50: 'var(--brand-50)',
    brand100: 'var(--brand-100)',
    brand200: 'var(--brand-200)',
    brand300: 'var(--brand-300)',
    brand400: 'var(--brand-400)',
    brand500: 'var(--brand-500)', // Base brand #008100 (Green)
    brand600: 'var(--brand-600)',
    brand700: 'var(--brand-700)',
    brand800: 'var(--brand-800)',
    brand900: 'var(--brand-900)',
    
    // Semantic Colors (mapped to brand palette)
    primary: 'var(--primary)', // #008100 (Green) for buttons with white text
    primaryHover: 'var(--primary-hover)',
    primaryActive: 'var(--primary-active)',
    primaryForeground: 'var(--primary-foreground)', // White text
    secondary: 'var(--secondary)', // Green tint for accents
    secondaryHover: 'var(--secondary-hover)',
    secondaryActive: 'var(--secondary-active)',
    secondaryForeground: 'var(--secondary-foreground)', // Dark text (NOT white)
    success: 'var(--success)', // Success green
    successForeground: 'var(--success-foreground)', // White text
    warning: 'var(--warning)', // Warning amber
    warningForeground: 'var(--warning-foreground)', // White text
    error: 'var(--error)',
    errorForeground: 'var(--error-foreground)',
    info: 'var(--info)', // Brand green #008100
    infoForeground: 'var(--info-foreground)', // White text
    background: 'var(--background)', // Light background #f9fbfc
    surface: 'var(--surface)', // Pure white
    surfaceElevated: 'var(--surface-elevated)',
    foreground: 'var(--foreground)', // Dark text #0f172a
    muted: 'var(--muted)',
    mutedForeground: 'var(--muted-foreground)', // Muted text #5b6b7a
    mutedSubtle: 'var(--muted-subtle)',
    accent: 'var(--accent)', // primary-50 #e7f5fb
    accentForeground: 'var(--accent-foreground)', // Dark text
    border: 'var(--border)', // Light border #d9e6ee
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

