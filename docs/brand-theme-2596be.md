# CareerHoop Brand Theme Documentation - #2596be

## Brand Color

**Brand Primary**: `#2596be` (primary-500)
- This is the authoritative brand color for CareerHoop
- Used for accents, icons, borders, focus rings
- **NOT** used for white text on solid backgrounds (does not meet WCAG AA contrast)

## Derived Brand Scale (50-900)

Based on `#2596be`, the complete scale:

| Token | Hex | Usage |
|-------|-----|-------|
| primary-50 | `#e7f5fb` | Very light background tints (nav active, card backgrounds) |
| primary-100 | `#d3eef8` | Light background tints |
| primary-200 | `#a8ddf1` | Borders for active states |
| primary-300 | `#7cccea` | Subtle accents |
| primary-400 | `#50bbe3` | Medium accents |
| primary-500 | `#2596be` | **Brand color** - icons, borders, focus rings |
| primary-600 | `#1f7fa1` | Links/text on white (meets WCAG AA) |
| primary-700 | `#196784` | Primary filled buttons with white text |
| primary-800 | `#134f66` | Hover states for primary buttons |
| primary-900 | `#0e3848` | Active/pressed states |

## Neutral Colors (Light UI)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` / `--background` | `#f9fbfc` | Page background |
| `--surface` | `#ffffff` | Card/surface backgrounds (white) |
| `--surface-2` | `#f2f7fa` | Soft blue tint for active nav backgrounds |
| `--border` | `#d9e6ee` | Standard borders |
| `--text` / `--foreground` | `#0f172a` | Main text color |
| `--muted-foreground` | `#5b6b7a` | Muted text |
| `--ring` | `rgba(37,150,190,0.35)` | Focus rings (primary-500 at 35% opacity) |

## Component Rules

### Primary Button
- **Background**: `primary-700` (`#196784`)
- **Text**: White (`--primary-foreground`)
- **Hover**: `primary-800` (`#134f66`)
- **Active**: `primary-900` (`#0e3848`)
- **Classes**: `bg-primary text-primary-foreground hover:bg-primary-hover`

### Secondary Button
- **Background**: `primary-50` (`#e7f5fb`)
- **Text**: Dark (`--text` / `--foreground`)
- **Border**: `--border` (`#d9e6ee`)
- **Hover**: `primary-100` (slightly darker)
- **Classes**: `bg-secondary/10 text-secondary-foreground border border-border hover:bg-secondary/20`

### Ghost Button
- **Background**: Transparent
- **Hover**: `primary-50` (`#e7f5fb`)
- **Classes**: `hover:bg-accent hover:text-accent-foreground`

### Links (on white background)
- **Color**: `primary-600` (`#1f7fa1`) - **NOT** primary-500 (contrast insufficient)
- **Hover**: `primary-700` (`#196784`)
- **Classes**: `text-secondary hover:text-secondary-hover` (where secondary = primary-500 for links)

### Sidebar Active State
- **Background**: `primary-50` (`#e7f5fb`)
- **Text**: Dark (`--foreground`)
- **Border**: `primary-200` (`#a8ddf1`)
- **Left indicator**: `primary-500` (`#2596be`) - 3px solid
- **Classes**: `bg-[var(--primary-soft)] text-foreground border border-[var(--primary-soft-border)] border-l-[3px] border-l-[var(--secondary)]`

### Accents (icons, borders, highlights)
- **Color**: `primary-500` (`#2596be`)
- **Background tints**: `primary-50` (`#e7f5fb`)
- **Border accents**: `primary-200` (`#a8ddf1`)

## Non-Negotiable Rules

### 1. Light Theme Only
- **NO large dark blocks** for sidebar/backgrounds
- Sidebar background must be white (`#ffffff`)
- Cards/surfaces must be white (`#ffffff`)
- Only use dark colors for text and small UI elements

### 2. Consistent Component System
- All components must use CSS variables (tokens)
- No random/hardcoded colors
- Buttons, cards, inputs, badges, sidebar items use tokens
- Access via: `bg-primary`, `text-primary-foreground`, `border-border`, etc.

### 3. No Hover Overlap / No Layout Shift
- **Hover MUST NOT change**: padding, border width, font-weight, element size
- **Use only**: `transform` (small `translateY`), `box-shadow`, color changes
- **Icons**: Fixed size, `shrink-0`, never collide with text
- **Transitions**: `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`

### 4. Consistent Transitions
- **Standard transition**: `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`
- **Duration**: Always `200ms` (duration-200)
- **Easing**: Always `ease-out`
- **Never use**: `transition-all`

### 5. Focus/Visibility
- **Focus rings**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Ring color**: `rgba(37,150,190,0.35)` (primary-500 at 35% opacity)
- **Required for**: All interactive elements (links, buttons, inputs, nav items)
- **No clipped dropdowns/modals**: Fix overflow/z-index issues

## Accessibility

### WCAG AA Compliance
- **#2596be on white**: Does NOT meet WCAG AA for normal text (ratio: ~3.2:1)
- **Solution**: Use `primary-600` (`#1f7fa1`) for links/text on white (ratio: ~4.5:1 ✓)
- **Primary buttons**: Use `primary-700` (`#196784`) with white text (ratio: ~7:1 ✓)
- **Text on primary-50**: Dark text on light blue background meets AA (ratio: ~8:1 ✓)

### Contrast Guidelines
- **Primary buttons**: `primary-700` bg + white text = ✓ WCAG AA
- **Links**: `primary-600` on white = ✓ WCAG AA
- **Text on tinted backgrounds**: Always use dark text (`--foreground`) on light backgrounds

## CSS Variables Reference

### Core Colors
```css
--primary: #196784;              /* primary-700 for buttons */
--primary-hover: #134f66;        /* primary-800 */
--primary-active: #0e3848;       /* primary-900 */
--primary-foreground: #ffffff;   /* White text */
--primary-soft: #e7f5fb;         /* primary-50 for nav active */
--primary-soft-border: #a8ddf1;  /* primary-200 */
--secondary: #2596be;            /* primary-500 for accents */
--secondary-foreground: #0f172a; /* Dark text */
```

### Surface Colors
```css
--bg: #f9fbfc;
--background: #f9fbfc;
--surface: #ffffff;
--surface-2: #f2f7fa;
--foreground: #0f172a;
--border: #d9e6ee;
--ring: rgba(37,150,190,0.35);
```

### Sidebar Colors
```css
--sidebar: #ffffff;
--sidebar-primary: #e7f5fb;      /* primary-50 */
--sidebar-primary-foreground: #0f172a;
--sidebar-border: #d9e6ee;
```

## Usage Examples

### Primary Button
```jsx
<Button className="bg-primary text-primary-foreground hover:bg-primary-hover">
  Get Started
</Button>
```

### Link (on white)
```jsx
<a className="text-secondary hover:text-secondary-hover">
  Learn more
</a>
```

### Active Nav Item
```jsx
<Button
  className={cn(
    "bg-[var(--primary-soft)] text-foreground border border-[var(--primary-soft-border)] border-l-[3px] border-l-[var(--secondary)]"
  )}
>
  Dashboard
</Button>
```

### Card Hover (no layout shift)
```jsx
<Card className="transition-[box-shadow,border-color] duration-200 ease-out hover:shadow-lg hover:border-primary/20">
  {/* content */}
</Card>
```

## Migration Notes

This theme replaces the previous green/teal palette:
- Old primary (Ink Teal `#48685C`) → New primary-700 (`#196784`)
- Old secondary (Aqua Teal `#61C291`) → New secondary (`#2596be`)
- All hardcoded colors replaced with CSS variables
- Sidebars updated to use token system
