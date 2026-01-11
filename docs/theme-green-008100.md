# CareerHoop Brand Theme Documentation - #008100

## Brand Color

**Brand Primary**: `#008100` (green-500)
- This is the authoritative brand color for CareerHoop
- Used for primary buttons, CTAs, icons, borders, focus rings
- Meets WCAG AA contrast when used with white text

## Green Color Scale (50-900)

Based on `#008100`, the complete scale:

| Token | Hex | Usage |
|-------|-----|-------|
| green-50 | `#eef8ee` | Very light background tints (nav active, card backgrounds) |
| green-100 | `#ddf1dd` | Light background tints |
| green-200 | `#bfe3bf` | Borders for active states |
| green-300 | `#93cc93` | Subtle accents |
| green-400 | `#4faa4f` | Medium accents |
| green-500 | `#008100` | **Brand color** - primary buttons, icons, borders, focus rings |
| green-600 | `#007200` | Hover states for filled buttons |
| green-700 | `#005f00` | Active/pressed states |
| green-800 | `#004a00` | Darker shades |

## CSS Variables (Token System)

### Brand Scale
- `--brand-50`: `#eef8ee`
- `--brand-100`: `#ddf1dd`
- `--brand-200`: `#bfe3bf`
- `--brand-300`: `#93cc93`
- `--brand-400`: `#4faa4f`
- `--brand-500`: `#008100` (Base brand color)
- `--brand-600`: `#007200`
- `--brand-700`: `#005f00`
- `--brand-800`: `#004a00`
- `--brand-900`: `#004a00`

### Primary Colors
- `--primary`: `#008100` (green-500 for primary buttons)
- `--primary-hover`: `#007200` (green-600)
- `--primary-active`: `#005f00` (green-700)
- `--primary-foreground`: `#ffffff` (White text on primary buttons)
- `--primary-soft`: `#eef8ee` (green-50 for nav active backgrounds)
- `--primary-soft-border`: `#bfe3bf` (green-200 for borders)

### Secondary Colors
- `--secondary`: `#eef8ee` (green-50 for secondary backgrounds)
- `--secondary-hover`: `#ddf1dd` (green-100)
- `--secondary-active`: `#bfe3bf` (green-200)
- `--secondary-foreground`: `#0f172a` (Dark text - NOT white)

### Neutral Colors (Light UI)
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` / `--background` | `#f9fbfc` | Page background |
| `--surface` | `#ffffff` | Card/surface backgrounds (white) |
| `--surface-2` | `#f3f7f5` | Soft green tint for active nav backgrounds |
| `--border` | `#d9e6de` | Standard borders |
| `--text` / `--foreground` | `#0f172a` | Main text color |
| `--muted-foreground` | `#5b6b7a` | Muted text |
| `--ring` | `rgba(0,129,0,0.25)` | Focus rings (green-500 at 25% opacity) |

### Semantic Colors
- `--success`: `#10b981` (Keep green for success states)
- `--warning`: `#f59e0b` (Keep amber for warning states)
- `--error`: `#ef4444` (Keep red for error states)
- `--info`: `#008100` (Use brand primary-500)

### Accent Colors
- `--accent`: `#eef8ee` (green-50 - Background tints, subtle fills)
- `--accent-foreground`: `#0f172a` (Dark text)

### Sidebar Colors
- `--sidebar`: `#ffffff` (White sidebar background)
- `--sidebar-foreground`: `#0f172a` (Dark text)
- `--sidebar-primary`: `#eef8ee` (green-50 for active nav)
- `--sidebar-primary-foreground`: `#0f172a` (Dark text)
- `--sidebar-border`: `#d9e6de` (Border color)
- `--sidebar-ring`: `rgba(0,129,0,0.25)` (Focus ring)

## Component Rules

### Primary Button
- **Background**: `green-500` (`#008100`)
- **Text**: White (`--primary-foreground`)
- **Hover**: `green-600` (`#007200`)
- **Active**: `green-700` (`#005f00`)
- **Classes**: `bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active`
- **Transition**: `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`
- **Focus**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`

### Secondary Button
- **Background**: `green-50` (`#eef8ee`)
- **Text**: Dark (`--foreground`)
- **Border**: `green-200` (`#bfe3bf`)
- **Hover**: `green-100` (`#ddf1dd`)
- **Classes**: `border border-[var(--primary-soft-border)] bg-[var(--primary-soft)] text-foreground hover:bg-[var(--primary-soft)]/90`
- **CRITICAL**: NO layout shifts - border width stays constant, only border-color changes

### Ghost Button
- **Background**: Transparent
- **Hover**: `green-50` (`#eef8ee`)
- **Classes**: `hover:bg-accent hover:text-accent-foreground`
- **CRITICAL**: NO padding/border changes on hover

### Badge - Success Variant
- **Background**: `green-100` (`#ddf1dd`)
- **Text**: `green-700` (`#005f00`)
- **CRITICAL**: NOT white on light green (insufficient contrast)
- **Hover**: `green-200` (`#bfe3bf`)
- **Classes**: `bg-[#ddf1dd] text-[#005f00] hover:bg-[#bfe3bf]`

### Sidebar Active State
- **Background**: `green-50` (`#eef8ee`)
- **Text**: Dark (`--foreground`)
- **Border**: `green-200` (`#bfe3bf`)
- **Left indicator**: `green-500` (`#008100`) - 3px solid
- **Classes**: `bg-[var(--primary-soft)] text-foreground border border-[var(--primary-soft-border)] border-l-[3px] border-l-[var(--primary)]`
- **Shadow**: `shadow-sm` for subtle elevation

### Links
- **Color**: `green-700` (`#005f00`) for link text
- **Hover**: `green-800` (`#004a00`)
- **Underline**: `hover:underline` (no layout shift - underline-offset-4 prevents overlap)
- **Classes**: `text-[#005f00] hover:text-[#004a00] hover:underline underline-offset-4`

## Hover and Focus Rules

### Non-Negotiable: No Layout Shifts

1. **Border Width**: NEVER change on hover
   - ❌ FORBIDDEN: `hover:border-2`, `hover:border-[2px]`
   - ✅ ALLOWED: `border border-border hover:border-primary` (only color changes)

2. **Padding**: NEVER change on hover
   - ❌ FORBIDDEN: `hover:p-4`, `hover:px-6`, `hover:py-2`
   - ✅ ALLOWED: Padding stays constant

3. **Font Weight**: NEVER change on hover
   - ❌ FORBIDDEN: `hover:font-bold`, `hover:font-semibold`
   - ✅ ALLOWED: Font weight stays constant

4. **Scaling**: AVOID scale transforms
   - ❌ PREFER NOT: `hover:scale-105`, `hover:scale-110`
   - ✅ PREFERRED: `hover:translateY(-1px) hover:shadow-md` for elevation

5. **Icon Sizing**: MUST be fixed
   - ✅ REQUIRED: `[&_svg]:size-4 shrink-0 [&_svg]:shrink-0`
   - ✅ REQUIRED: Icons have fixed dimensions (e.g., `h-4 w-4`, `h-5 w-5`)
   - ✅ REQUIRED: Icons use `shrink-0` to prevent compression
   - ❌ FORBIDDEN: Icons that change size on hover

### Standard Hover Pattern

```css
transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out
hover:translateY(-1px) hover:shadow-md
```

For buttons and interactive elements:
- Use `translateY(-1px)` for subtle elevation (not scale)
- Use `shadow-md` or `shadow-lg` for depth
- Change `background-color` and `border-color` only (not width)
- Transition duration: `200ms` (duration-200)
- Easing: `ease-out`

### Focus States

- **Ring**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Ring Color**: `rgba(0,129,0,0.25)` (green-500 at 25% opacity)
- **Ring Width**: `2px` or `3px`
- **Ring Offset**: `2px` for visual separation
- **All interactive elements** must have visible focus rings

## Accessibility Guidelines

### Contrast Requirements

1. **White Text**: ONLY on `green-500`, `green-600`, `green-700`
   - ✅ ALLOWED: `bg-primary text-primary-foreground` (green-500 with white)
   - ✅ ALLOWED: `bg-[#007200] text-white` (green-600 with white)
   - ❌ FORBIDDEN: White text on `green-50`, `green-100`, `green-200` (insufficient contrast)

2. **Dark Text**: On light backgrounds
   - ✅ ALLOWED: `bg-[var(--primary-soft)] text-foreground` (green-50 with dark text)
   - ✅ ALLOWED: Success badge: `bg-[#ddf1dd] text-[#005f00]` (green-100 bg, green-700 text)

3. **Links**: Must meet WCAG AA contrast
   - ✅ ALLOWED: `text-[#005f00]` (green-700) on white background
   - ✅ ALLOWED: `text-[#004a00]` (green-800) on white background

### Focus Indicators

- **All interactive elements** must have visible focus rings
- Use `focus-visible:` (not `focus:`) to show only on keyboard navigation
- Ring color: `rgba(0,129,0,0.25)`
- Ring offset: `2px` minimum

## Responsive Guidelines

### Breakpoints
- **320px+**: Minimum supported width
- **375px**: Small mobile
- **768px**: Tablet
- **1024px**: Desktop
- **1280px**: Large desktop

### Requirements
- **Zero horizontal scroll** at all breakpoints
- **Sidebars collapse** properly on mobile (< 1024px)
- **Touch targets**: Minimum 44x44px on mobile
- **Spacing**: Consistent 8px grid system

## Transition Rules

### Standard Transition Pattern

```
transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out
```

- **Properties**: `transform`, `box-shadow`, `background-color`, `border-color`, `color`
- **Duration**: `200ms` (always)
- **Easing**: `ease-out` (always)
- **Applied to**: All interactive elements (buttons, links, cards, nav items)

### Exceptions

- **Active states**: `active:scale-[0.98]` is allowed (subtle press feedback)
- **Reduced motion**: Respect `@media (prefers-reduced-motion: reduce)` to disable animations

## Spacing and Typography

### Consistent Spacing (8px grid)
- `--spacing-1`: `0.25rem` (4px)
- `--spacing-2`: `0.5rem` (8px)
- `--spacing-3`: `0.75rem` (12px)
- `--spacing-4`: `1rem` (16px)
- `--spacing-6`: `1.5rem` (24px)
- `--spacing-8`: `2rem` (32px)

### Border Radius
- `--radius-sm`: `0.375rem` (6px)
- `--radius-md`: `0.5rem` (8px)
- `--radius-lg`: `0.75rem` (12px)
- **Cards**: `rounded-xl` (0.75rem)
- **Buttons**: `rounded-md` (0.5rem) or `rounded-full` for CTAs

### Shadows
- **Cards**: `shadow-sm`
- **Hover elevation**: `hover:shadow-md` or `hover:shadow-lg`
- **Dropdowns/Modals**: `shadow-xl`

## Implementation Checklist

### ✅ CSS Variables Updated
- [x] Brand scale (green-50 to green-900)
- [x] Primary colors (green-500/600/700)
- [x] Secondary colors (green-50/100/200)
- [x] Sidebar colors (green-50 active states)
- [x] Ring colors (green-500 at 25% opacity)
- [x] Border colors (green-tinted)

### ✅ Components Standardized
- [x] Button component uses CSS variables
- [x] Badge component (success uses green-100 bg + green-700 text)
- [x] NavItem component uses green-50 for active states
- [x] Card component uses CSS variables

### ✅ Sidebars Updated
- [x] Student sidebar: green-50 active bg, green-500 left border
- [x] Admin sidebar: matches Student sidebar
- [x] No layout shifts on hover

### ✅ Landing Pages
- [x] Primary CTAs use Button component (green theme)
- [x] Gradients use CSS variables
- [x] No hardcoded blue colors

### ✅ Hover/Focus Rules
- [x] No border-width changes on hover
- [x] No padding changes on hover
- [x] Icons are fixed size with shrink-0
- [x] Standard transitions: 200ms ease-out
- [x] Focus rings on all interactive elements

## Key Files Modified

1. `frontend/src/shared/styles/index.css` - CSS variables updated to green scale
2. `frontend/src/shared/components/ui/button.jsx` - Secondary variant uses green-50/200
3. `frontend/src/shared/components/ui/badge.jsx` - Success variant uses green-100 bg + green-700 text
4. `frontend/src/features/dashboard/components/sidebar.jsx` - Border indicator uses green-500
5. `frontend/src/features/admin/components/sidebar.jsx` - Border indicator uses green-500

## Migration Notes

- **Old color**: `#2596be` (blue) → **New color**: `#008100` (green)
- **Old primary-700**: `#196784` → **New primary**: `#008100` (green-500)
- **Old primary-50**: `#e7f5fb` (blue tint) → **New primary-soft**: `#eef8ee` (green-50)
- All components using CSS variables automatically inherit the green theme
- No hardcoded colors found (verified via grep)
