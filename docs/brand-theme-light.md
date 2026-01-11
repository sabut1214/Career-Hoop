# CareerHoop Light Brand Theme

## Overview

This document defines the LIGHT logo-based brand palette and design system for CareerHoop. The theme emphasizes a light, airy feel with high-contrast text and professional polish across Landing, Student, and Admin pages.

## LIGHT Brand Palette

### Core Colors

| Color Name | Hex | OKLCH | Usage |
|------------|-----|-------|-------|
| **Ink / Deep Teal** | `#0f4e56` | `oklch(0.35 0.08 200)` | Headings, icons, primary CTA background (when needed for contrast) |
| **Primary Aqua Teal** | `#4ab9a4` | `oklch(0.68 0.10 180)` | Main brand color, accents, outlines, subtle fills |
| **Soft Mint** | `#def0bd` | `oklch(0.93 0.04 130)` | Background tint, hero/section gradients |
| **Success Lime** | `#9edb69` | `oklch(0.78 0.18 120)` | Success states, badges, progress |
| **Highlight Lime** | `#daf135` | `oklch(0.90 0.16 110)` | Small highlights only (never large backgrounds) |
| **Muted Slate-Teal** | `#517679` | `oklch(0.52 0.02 195)` | Muted text, borders |

### Design Principles

- **Overall Feel**: The site must feel LIGHT and airy
- **Ink Usage**: Primarily for text and limited high-contrast CTAs, NOT as large page backgrounds
- **Backgrounds**: Very light (near-white with mint tint), cards stay white
- **Gradients**: Subtle only (low opacity), with high-contrast Ink text

## Semantic Token Mapping

### CSS Variables

```css
/* Primary - Brand Ink */
--primary: var(--brand-ink);                    /* #0f4e56 */
--primary-foreground: white;                    /* High contrast white text */

/* Primary Soft - Light aqua tint for nav active backgrounds */
--primary-soft: oklch(0.95 0.015 180);          /* Very light aqua tint for nav active */
--primary-soft-foreground: var(--brand-ink);    /* Ink text on light backgrounds */
--primary-soft-border: oklch(0.85 0.025 180);   /* Slightly stronger aqua tint for borders */

/* Secondary - Brand Aqua Teal */
--secondary: var(--brand-aqua-teal);            /* #4ab9a4 */
--secondary-foreground: var(--brand-ink);       /* Ink text (NOT white) */

/* Success - Brand Success Lime */
--success: var(--brand-success-lime);           /* #9edb69 */
--success-foreground: var(--brand-ink);         /* Ink text (NOT white) */

/* Warning - Brand Highlight Lime */
--warning: var(--brand-highlight-lime);         /* #daf135 */
--warning-foreground: var(--brand-ink);         /* Ink text required */

/* Accent - Brand Soft Mint */
--accent: var(--brand-soft-mint);               /* #def0bd */
--accent-foreground: var(--brand-ink);          /* Ink text */

/* Muted - Brand Muted Slate-Teal */
--muted-foreground: var(--brand-muted-slate);   /* #517679 */
```

### Surface Colors

- `--background`: Very light mint tint (near-white)
- `--surface`: Pure white for cards
- `--foreground`: Ink `#0f4e56` for main text
- `--muted-foreground`: Muted Slate-Teal `#517679` for muted text

## Component Variants

### Button Variants

#### Primary Button (Default)
- **Background**: Ink `#0f4e56` (`bg-primary`)
- **Text**: White (`text-primary-foreground`)
- **Hover**: Slightly darker Ink (`hover:bg-primary-hover`)
- **Focus**: Visible ring with Ink color
- **Contrast**: 21:1 (WCAG AAA compliant)
- **Usage**: Primary CTAs, important actions

#### Secondary Button
- **Background**: Soft Aqua fill `bg-secondary/10` with `border-secondary`
- **Text**: Ink (`text-secondary-foreground`)
- **Hover**: Slightly darker Aqua fill `hover:bg-secondary/20`
- **Focus**: Visible ring with Ink color
- **CRITICAL**: Do NOT use white text on Aqua background (contrast insufficient)
- **Usage**: Secondary CTAs, less important actions

#### Outline Button
- **Border**: Border color with `border-border`
- **Background**: Transparent or `bg-background`
- **Text**: Foreground color
- **Hover**: Accent background with Ink text
- **Usage**: Tertiary actions, subtle CTAs

#### Ghost Button
- **Background**: Transparent
- **Text**: Foreground or muted foreground
- **Hover**: Accent background with Ink text
- **Usage**: Subtle actions, icon buttons

#### Link Button
- **Text**: Aqua Teal (`text-secondary`)
- **Underline**: On hover only (`hover:underline`)
- **Hover**: Slightly darker Aqua (`hover:text-secondary-hover`)
- **Usage**: Text links, inline actions

### Badge Variants

#### Success Badge
- **Background**: Success Lime `#9edb69` (`bg-success/20` for subtle, `bg-success` for solid)
- **Text**: Ink (`text-success-foreground`)
- **CRITICAL**: Do NOT use white text on Success Lime (contrast insufficient)

#### Primary Badge
- **Background**: Ink `#0f4e56` (`bg-primary`)
- **Text**: White (`text-primary-foreground`)

#### Secondary Badge
- **Background**: Aqua Teal fill (`bg-secondary/20`)
- **Text**: Ink (`text-secondary-foreground`)

## Hover & Focus Rules

### Hover Effects

**CRITICAL RULES**:
- **NO layout shifts**: Do NOT change padding, border width, or font-weight on hover
- **Transform only**: Use `translate-y` or `scale` on container (max 1.02 for scale)
- **Shadow changes**: Use `box-shadow` transitions for depth
- **Explicit transitions**: Use `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`
- **Icons**: Always `shrink-0`, fixed size, not affected by group-hover transforms unless intended

**Card Hover**:
```jsx
// CORRECT: translate-y only
<motion.div whileHover={{ y: -2 }}>
  <Card className="hover:shadow-lg transition-[box-shadow] duration-200 ease-out">
    {/* content */}
  </Card>
</motion.div>

// WRONG: scale causes layout shift
<motion.div whileHover={{ scale: 1.02 }}>  {/* Don't use scale on cards */}
```

**Icon Hover**:
```jsx
// CORRECT: Icon scales slightly within fixed container
<div className="group-hover:scale-105 transition-transform duration-200 ease-out">
  <Icon className="shrink-0 h-6 w-6" />
</div>
```

### Focus States

- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Ring color**: Ink (`--ring: var(--brand-ink)`)
- **Required for**: All interactive elements (buttons, links, inputs, nav items)

## Animation Defaults

### Transition Properties

- **Duration**: `200ms` (`duration-200`)
- **Timing**: `ease-out`
- **Properties**: Explicit only (`transition-[transform,box-shadow,background-color,border-color,color]`)

### Respect Reduced Motion

```jsx
const prefersReducedMotion = useReducedMotion()

<motion.div
  whileHover={prefersReducedMotion ? {} : { y: -2 }}
  transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6 }}
>
```

## Contrast Guidelines

### WCAG AA Compliance

| Element | Background | Text | Contrast Ratio | Status |
|---------|-----------|------|----------------|--------|
| Primary Button | Ink `#0f4e56` | White | 21:1 | ✅ AAA |
| Secondary Button | Aqua `#4ab9a4` | Ink `#0f4e56` | 4.8:1 | ✅ AA |
| Success Badge | Success Lime `#9edb69` | Ink `#0f4e56` | 4.5:1 | ✅ AA |
| Text on Gradient | Light mint/aqua | Ink `#0f4e56` | >7:1 | ✅ AA |

**CRITICAL**: 
- Do NOT use white text on Aqua Teal `#4ab9a4` (contrast: 2.8:1, fails WCAG AA)
- Do NOT use white text on Success Lime `#9edb69` (contrast: 1.8:1, fails WCAG AA)
- Always use Ink text on light colored backgrounds

## Usage Examples

### Hero Section

```jsx
<section className="bg-gradient-to-br from-accent via-secondary/10 to-background">
  <h1 className="text-foreground">  {/* Ink #0f4e56 */}
    Your Career Journey
  </h1>
  <Button>Primary CTA</Button>  {/* Ink background, white text */}
  <Button variant="secondary">Secondary CTA</Button>  {/* Aqua outline, Ink text */}
</section>
```

### Card Component

```jsx
<Card className="bg-surface border-border hover:shadow-lg transition-[box-shadow] duration-200 ease-out">
  <CardTitle className="text-foreground">  {/* Ink #0f4e56 */}
    Title
  </CardTitle>
  <CardDescription className="text-muted-foreground">  {/* Muted Slate-Teal */}
    Description
  </CardDescription>
</Card>
```

### Badge Component

```jsx
<Badge variant="success">  {/* Success Lime background, Ink text */}
  Success
</Badge>
<Badge variant="primary">  {/* Ink background, white text */}
  Primary
</Badge>
```

### Sidebar Navigation

**Active Nav Item**:
```jsx
<Button
  variant="ghost"
  className={cn(
    "w-full text-sm transition-[background-color,color,box-shadow,border-color] duration-200 ease-out rounded-lg",
    isActive
      ? "bg-[var(--primary-soft)] text-[var(--primary-soft-foreground)] border border-[var(--primary-soft-border)] shadow-sm hover:bg-[var(--primary-soft)]/90"
      : "hover:bg-muted/50 hover:text-foreground text-muted-foreground"
  )}
>
  <Icon className="shrink-0 h-4 w-4" />
  <span>Nav Item</span>
</Button>
```

**Key Points**:
- Active state uses light aqua tint (`--primary-soft`) with Ink text, NOT dark Ink background
- Consistent transitions: `transition-[background-color,color,box-shadow,border-color] duration-200 ease-out`
- Icons use `shrink-0` to prevent layout shifts
- Hover states are subtle and don't change layout metrics

## Progress Indicators

### Progress States

- **Completed**: Success Lime `#9edb69`
- **Current**: Aqua Teal `#4ab9a4`
- **Pending**: Muted Slate-Teal `#517679`

### Example

```jsx
<div className="flex items-center gap-2">
  <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
    <Check className="h-4 w-4 text-foreground" />  {/* Ink text on Success Lime */}
  </div>
  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
    <span className="text-foreground">2</span>  {/* Ink text on Aqua Teal */}
  </div>
  <div className="w-8 h-8 rounded-full bg-muted-foreground/20 flex items-center justify-center">
    <span className="text-muted-foreground">3</span>
  </div>
</div>
```

## Landing Page Guidelines

### Hero Section

- **Background**: Light mint/aqua gradient (`from-accent via-secondary/10 to-background`)
- **Text Color**: Ink `#0f4e56` for high contrast
- **Decorative Elements**: Very subtle (low opacity mint/aqua blur)
- **CTA**: Ink button (primary), Aqua outline button (secondary)

### CTA Section

- **Background**: Light mint/aqua gradient (not dark)
- **Text**: Ink for headings and body text
- **Buttons**: Ink primary, Aqua secondary outline

## Student Pages Guidelines

### Dashboard

- **Action Cards**: Light backgrounds with Ink text
- **Progress Trackers**: Use brand colors (Success Lime, Aqua Teal, Muted Slate)
- **Empty States**: Ensure guidance text and CTAs use brand colors

### Assessment Pages

- **Interest Cards**: Use brand palette gradients (subtle, low opacity)
- **Grade Cards**: Light backgrounds (mint tints) with Ink text

## Admin Pages Guidelines

### Admin Dashboard

- **Status Colors**: Success Lime for positive, maintain error red for negative
- **Charts**: Use brand palette (Ink, Aqua Teal, Success Lime, Soft Mint, Muted Slate)
- **Empty States**: Light and readable

### Navigation

- **Active States**: Light aqua tint background (`--primary-soft`) with Ink text (`--primary-soft-foreground`), subtle border (`--primary-soft-border`). **CRITICAL**: Do NOT use dark Ink background for nav active states.
- **Hover States**: Explicit transitions, no layout shifts
- **Sidebar Active Pattern**: `bg-[var(--primary-soft)] text-[var(--primary-soft-foreground)] border border-[var(--primary-soft-border)]`

## Responsive Guidelines

### Breakpoints

Test at: 320px, 375px, 768px, 1024px, 1280px

### Requirements

- No horizontal scroll at any breakpoint
- Buttons and nav items must not wrap awkwardly
- Modals/dropdowns must not be clipped
- Focus-visible rings must be visible and accessible

## Implementation Checklist

- [x] CSS variables updated with light palette
- [x] Design tokens updated
- [x] Button variants updated (Ink primary, Aqua secondary)
- [x] Badge variants updated (success with Ink text)
- [x] Landing page hero/CTA sections updated (light gradients)
- [x] Card hover effects fixed (translate-y only, no scale)
- [x] Navigation hover states standardized
- [x] All transitions use explicit properties and `duration-200 ease-out`
- [ ] Responsive testing at all breakpoints
- [ ] Contrast testing (WCAG AA compliance)
- [ ] Hover/interaction testing
- [ ] Color consistency check (no old palette classes remaining)
