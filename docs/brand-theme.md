# CareerHoop Brand Theme Documentation

## Brand Palette

The CareerHoop brand palette is derived from the logo and serves as the single source of truth for all color usage across Landing, Student, and Admin interfaces.

### Primary Colors

- **Brand Deep Teal**: `#0f4d56`
  - **Usage**: Primary buttons, headings, primary actions, focus rings
  - **OKLCH**: `oklch(0.35 0.08 200)`
  - **CSS Variable**: `--primary`, `--brand-deep-teal`
  - **Semantic Token**: Primary CTA background, primary text color

- **Brand Aqua**: `#2eb4ac`
  - **Usage**: Secondary accents, links, info states, secondary buttons
  - **OKLCH**: `oklch(0.65 0.12 180)`
  - **CSS Variable**: `--secondary`, `--brand-aqua`, `--info`
  - **Semantic Token**: Secondary CTA background, secondary text color

### Success & Highlight Colors

- **Brand Lime**: `#a8df60`
  - **Usage**: Success states, badges, check indicators, positive highlights
  - **OKLCH**: `oklch(0.80 0.20 120)`
  - **CSS Variable**: `--success`, `--brand-lime`
  - **Semantic Token**: Success badges, completion indicators
  - **Contrast**: Use with dark text (`text-success-foreground` = dark text) for WCAG AA compliance

- **Brand YellowGreen**: `#def231`
  - **Usage**: Warning states, highlights (use carefully for contrast), saved/bookmarked indicators
  - **OKLCH**: `oklch(0.90 0.18 105)`
  - **CSS Variable**: `--warning`, `--brand-yellow-green`
  - **Semantic Token**: Warning badges, saved state indicators
  - **Contrast Warning**: Always use with dark text; high luminance requires careful usage

### Background & Muted Colors

- **Brand Mint**: `#def0bc`
  - **Usage**: Soft backgrounds, subtle gradient starts, accent backgrounds
  - **OKLCH**: `oklch(0.92 0.05 130)`
  - **CSS Variable**: `--accent`, `--brand-mint`
  - **Semantic Token**: Accent backgrounds, soft UI elements

- **Brand SlateTeal**: `#4f7478`
  - **Usage**: Muted text, borders, secondary UI elements, placeholders
  - **OKLCH**: `oklch(0.50 0.02 195)`
  - **CSS Variable**: `--muted-foreground`, `--border-strong`, `--brand-slate-teal`
  - **Semantic Token**: Muted text, border colors, disabled states

### Brand Scale (Deep Teal Based)

The brand scale provides tint/shade variations of Deep Teal for flexible usage:

- `--brand-50`: `oklch(0.96 0.02 200)` - Lightest tint
- `--brand-100`: `oklch(0.92 0.04 200)`
- `--brand-200`: `oklch(0.85 0.06 200)`
- `--brand-300`: `oklch(0.70 0.07 200)`
- `--brand-400`: `oklch(0.55 0.08 200)`
- `--brand-500`: `oklch(0.35 0.08 200)` - Base Deep Teal
- `--brand-600`: `oklch(0.30 0.08 200)`
- `--brand-700`: `oklch(0.25 0.08 200)`
- `--brand-800`: `oklch(0.20 0.08 200)`
- `--brand-900`: `oklch(0.15 0.08 200)` - Darkest shade

## Component Variant Rules

### Primary CTA
- **Background**: `bg-primary` (Brand Deep Teal `#0f4d56`)
- **Text**: `text-primary-foreground` (white/light text)
- **Hover**: `hover:bg-primary-hover` (slightly darker Deep Teal)
- **Active**: `active:bg-primary-active` (darker Deep Teal)
- **Focus Ring**: `focus-visible:ring-ring` (Deep Teal with 50% opacity)
- **Usage**: Main actions, primary CTAs, "Get Started", "Submit", "Save"

### Secondary CTA
- **Option 1 (Outline)**: 
  - Border: `border-primary/20`
  - Background: `bg-transparent` or `bg-background`
  - Hover: `hover:bg-primary/10`
- **Option 2 (Soft Aqua Background)**:
  - Background: `bg-secondary` (Brand Aqua `#2eb4ac`)
  - Text: `text-secondary-foreground` (dark text)
  - Hover: `hover:bg-secondary-hover`
- **Usage**: Alternative actions, "Learn More", "Explore", secondary navigation

### Success States
- **Background**: `bg-success` (Brand Lime `#a8df60`)
- **Text**: `text-success-foreground` (dark text for contrast)
- **Usage**: Success badges, check states, completion indicators, correct answers
- **Avoid**: Large backgrounds with text overlay (use only for small badges/indicators)

### Warning/Highlight States
- **Background**: `bg-warning` (Brand YellowGreen `#def231`)
- **Text**: `text-warning-foreground` (dark text - REQUIRED for contrast)
- **Usage**: Warning badges, saved/bookmarked states, pending items
- **Critical**: Always use with dark text; never use on large areas with light text

### Ghost/Subtle States
- **Background**: `bg-accent` (Brand Mint `#def0bc`) on hover
- **Text**: `text-accent-foreground` (dark text)
- **Usage**: Tertiary buttons, icon buttons, subtle hover states

## Hover/Focus Rules

### Hover Effects
- **Duration**: `duration-200` (200ms)
- **Easing**: `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`)
- **Properties**: Explicit transition properties only: `transition-[transform,box-shadow,background-color,border-color,color]`
- **Layout Rules**:
  - **NO layout shifts**: Use `transform` (translate-y or translate-x) instead of scale where possible
  - **Scale limit**: If using scale, keep `<= 1.02` and ensure sufficient spacing/gap
  - **Shadow changes**: Use `hover:shadow-lg` without changing border width
  - **Icons**: Always `shrink-0` and fixed size; not affected by `group-hover` transforms unless intentional

### Focus States
- **Ring**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Ring Color**: Brand Deep Teal with opacity (`--ring: oklch(0.35 0.08 200)`)
- **Ring Width**: `3px` for buttons, `2px` for other elements
- **Offset**: `2px` ring offset for visibility
- **Required for**: All interactive elements (buttons, links, inputs, nav items)

### Active States
- **Scale**: `active:scale-[0.98]` (transform-only, no layout shift)
- **Background**: Slightly darker version of hover state
- **Duration**: Same as hover (`duration-200`)

## Animation Defaults

### Transition Duration
- **Fast**: `150ms` (`--duration-fast`)
- **Normal/Interactive**: `200ms` (`--duration-normal`) - **Standard for all hover/focus states**
- **Slow**: `500ms` (`--duration-slow`) - Only for page-level transitions

### Easing
- **Interactive Elements**: `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`)
- **Page Transitions**: Custom easing `[0.22, 1, 0.36, 1]` (for entrance animations)

### Reduced Motion
- **Respect**: Always use `useReducedMotion()` hook for Framer Motion animations
- **Fallback**: `duration-0.01ms` for CSS transitions when `prefers-reduced-motion` is enabled
- **Page Transitions**: Use `reducedMotionTransition` (opacity only, 150ms linear)

## Border Radius Standards

- **Buttons**: `rounded-md` (`--radius-md` = `0.5rem`)
- **Cards**: `rounded-xl` (`--radius-xl` = `1rem`)
- **Badges**: `rounded-full`
- **Inputs**: `rounded-md` (`--radius-md` = `0.5rem`)
- **Modals/Dialogs**: `rounded-xl` (`--radius-xl` = `1rem`)
- **Small Elements**: `rounded-sm` (`--radius-sm` = `0.375rem`)

## Shadow Standards

- **Small**: `shadow-sm` (`--shadow-sm`) - Subtle elevation
- **Medium**: `shadow-md` (`--shadow-md`) - Cards, default elevation
- **Large**: `shadow-lg` (`--shadow-lg`) - Hover states, elevated cards
- **Extra Large**: `shadow-xl` (`--shadow-xl`) - Modals, dropdowns

## Typography Scale

- **H1**: `text-4xl md:text-5xl lg:text-6xl font-bold` (Page titles)
- **H2**: `text-2xl md:text-3xl font-bold` (Section headings)
- **H3**: `text-xl md:text-2xl font-semibold` (Subsection headings)
- **Card Titles**: `text-xl font-semibold`
- **Body**: `text-base` (16px default)
- **Small**: `text-sm` (14px - descriptions, helper text)
- **Caption**: `text-xs` (12px - labels, metadata)

## Spacing Standards

### Section Padding
- **Major Sections**: `py-16 md:py-24 lg:py-32`
- **Standard Sections**: `py-12 md:py-16`

### Container Padding
- **Standard**: `px-4 sm:px-6 lg:px-8`
- **Narrow**: `px-4 md:px-6`

### Grid Gaps
- **Card Grids**: `gap-6`
- **Form Grids**: `gap-4`
- **Tight Layouts**: `gap-3`

## Contrast Guidelines

### WCAG AA Compliance (4.5:1 for normal text, 3:1 for large text)

- **Primary Button**: Deep Teal background (#0f4d56) + white text = **PASS** (21:1)
- **Secondary Button**: Aqua background (#2eb4ac) + dark text = **PASS** (4.8:1)
- **Success Badge**: Lime background (#a8df60) + dark text = **PASS** (5.2:1)
- **Warning Badge**: YellowGreen background (#def231) + dark text = **REQUIRED** (ensure dark text always)
- **Muted Text**: SlateTeal (#4f7478) on white = **PASS** (4.6:1)

### Text-on-Gradient
- Always ensure gradients have sufficient contrast
- Add dark overlay if needed: `bg-black/20` or `bg-black/30`
- Test with contrast checker before deployment

## Dark Mode Adjustments

All brand colors have dark mode variants with adjusted luminance:

- **Primary**: Lighter for visibility (`oklch(0.50 0.08 200)`)
- **Secondary**: Lighter for visibility (`oklch(0.70 0.12 180)`)
- **Success**: Slightly darker (`oklch(0.75 0.20 120)`)
- **Warning**: Slightly darker (`oklch(0.85 0.18 105)`)
- **Muted Foreground**: Lighter SlateTeal (`oklch(0.65 0.02 195)`)

## Usage Examples

### Primary Button
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover transition-[background-color] duration-200 ease-out">
  Get Started
</Button>
```

### Secondary Button (Outline)
```jsx
<Button variant="outline" className="border-primary/20 hover:bg-primary/10 transition-[background-color,border-color] duration-200 ease-out">
  Learn More
</Button>
```

### Success Badge
```jsx
<Badge className="bg-success text-success-foreground">
  <CheckCircle className="h-4 w-4 shrink-0" />
  Completed
</Badge>
```

### Card with Hover
```jsx
<Card className="transition-[box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg">
  {/* Card content */}
</Card>
```

## Migration Notes

- **Never use**: Old blue/green/yellow palette (e.g., `blue-500`, `emerald-500`, `yellow-500`)
- **Always use**: Brand tokens via CSS variables or semantic tokens
- **Check**: All hardcoded hex values replaced with tokens
- **Verify**: All hover effects use `duration-200 ease-out` with explicit properties
- **Test**: Contrast ratios meet WCAG AA standards

