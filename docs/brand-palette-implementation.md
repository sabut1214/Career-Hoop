# CareerHoop Brand Palette Implementation

## Overview

This document defines the authoritative brand palette and design system for CareerHoop, ensuring a light, modern UI with consistent color usage across Landing, Student, and Admin interfaces.

## Brand Palette (Authoritative)

### Core Colors

| Color Name | Hex | Usage |
|------------|-----|-------|
| **Ink Teal** | `#48685C` | Headings, icons, primary CTA buttons, text |
| **Aqua Teal** | `#61C291` | Main brand color, accents, links, secondary buttons |
| **Fresh Green** | `#96DB6A` | Success states, badges, positive indicators |
| **Spring Green** | `#AFE157` | Highlights, warning states |
| **Lime Highlight** | `#D3ED40` | Small highlights only (never large backgrounds) |
| **Charcoal** | `#202020` | Optional, avoid for large fills |

### Light Surface Colors (Authoritative)

| Token | Hex | Usage |
|-------|-----|-------|
| `--bg` / `--background` | `#FBFDFC` | Page backgrounds |
| `--surface` | `#FFFFFF` | Card backgrounds, elevated surfaces |
| `--surface-2` | `#ECF8F2` | Active nav backgrounds, soft aqua tint |
| `--success-soft` | `#F2FBED` | Soft success backgrounds |
| `--highlight-soft` | `#FAFDE8` | Soft highlight backgrounds |
| `--border` | `#DDECE5` | Borders, dividers |
| `--ring` | `rgba(97,194,145,0.35)` | Focus rings (Aqua Teal 35% opacity) |

## CSS Variable Mapping

### Primary Colors

- `--primary`: `#48685C` (Ink Teal)
- `--primary-foreground`: `#FFFFFF` (White)
- `--primary-hover`: `#3A5349` (Slightly darker Ink Teal)
- `--primary-active`: `#2C3E36` (Darker Ink Teal)
- `--primary-soft`: `#ECF8F2` (Surface-2 for nav active states)
- `--primary-soft-foreground`: `#48685C` (Ink Teal text)
- `--primary-soft-border`: `#DDECE5` (Border color)

### Secondary Colors

- `--secondary`: `#61C291` (Aqua Teal)
- `--secondary-foreground`: `#48685C` (Ink Teal text - NOT white)
- `--secondary-hover`: `#4FB085` (Slightly darker Aqua Teal)
- `--secondary-active`: `#3D9E79` (Darker Aqua Teal)

### Semantic Colors

- `--success`: `#96DB6A` (Fresh Green)
- `--success-foreground`: `#48685C` (Ink Teal text - NOT white)
- `--warning`: `#AFE157` (Spring Green)
- `--warning-foreground`: `#48685C` (Ink Teal text)
- `--error`: (Existing error color)
- `--info`: `#61C291` (Aqua Teal)
- `--info-foreground`: `#48685C` (Ink Teal text)

### Accent Colors

- `--accent`: `#ECF8F2` (Surface-2)
- `--accent-foreground`: `#48685C` (Ink Teal text)

### Sidebar Colors

- `--sidebar`: `#FFFFFF` (White)
- `--sidebar-foreground`: `#48685C` (Ink Teal)
- `--sidebar-primary`: `#ECF8F2` (Surface-2 for active nav)
- `--sidebar-primary-foreground`: `#48685C` (Ink Teal text)
- `--sidebar-border`: `#DDECE5` (Border color)

## Component Standards

### Primary Button

- **Background**: `bg-primary` (Ink Teal `#48685C`)
- **Text**: `text-primary-foreground` (White)
- **Hover**: `hover:bg-primary-hover` (Slightly darker, not black)
- **Focus**: `focus-visible:ring-ring` (Aqua Teal ring)
- **Usage**: Main CTAs, primary actions

### Secondary Button

- **Background**: `bg-secondary/10` with `border-secondary`
- **Text**: `text-secondary-foreground` (Ink Teal)
- **Hover**: `hover:bg-secondary/20`
- **Usage**: Secondary actions, alternative options
- **CRITICAL**: Do NOT use white text on Aqua Teal background (contrast insufficient)

### Success Badge

- **Background**: `bg-success/20` or `bg-success`
- **Text**: `text-success-foreground` (Ink Teal)
- **Usage**: Success states, completion indicators
- **CRITICAL**: Do NOT use white text on Fresh Green (contrast insufficient)

### Sidebar Active State

- **Background**: `bg-[#ECF8F2]` (Surface-2)
- **Text**: `text-[#48685C]` (Ink Teal)
- **Border**: `border border-[#DDECE5]` with `border-l-[3px] border-l-[#61C291]` (left indicator)
- **Shadow**: `shadow-sm`
- **Usage**: Active navigation items
- **CRITICAL**: No dark teal fills - must be light and airy

## Hover & Focus Rules

### Hover Effects

**CRITICAL RULES**:
1. **NO layout shifts**: Do NOT change padding, border width, or font-weight on hover
2. **Transform only**: Use `translateY(-1px)` or `scale` on container (max 1.02 for scale)
3. **Shadow changes**: Use `box-shadow` transitions for depth
4. **Explicit transitions**: Always use `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`
5. **Icons**: Always `shrink-0`, fixed size containers, no collision with text

**Standard Pattern**:
```jsx
className="transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out hover:shadow-lg"
```

**Card Hover**:
```jsx
// CORRECT: translate-y only
<motion.div whileHover={{ y: -2 }}>
  <Card className="hover:shadow-lg transition-[box-shadow] duration-200 ease-out">
    {/* content */}
  </Card>
</motion.div>
```

**Icon Hover**:
```jsx
// CORRECT: Icon scales within fixed container
<div className="w-12 h-12 shrink-0 group-hover:scale-105 transition-transform duration-200 ease-out">
  <Icon className="h-6 w-6 shrink-0" />
</div>
```

### Focus States

- **Ring**: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- **Ring Color**: Aqua Teal with 35% opacity `rgba(97,194,145,0.35)`
- **Required for**: All interactive elements (buttons, links, inputs, nav items)

## Design Principles

### Light UI (Non-Negotiable)

1. **NO large dark fills**:
   - Do NOT use Ink Teal (`#48685C`) as big backgrounds for sidebar/sections/cards
   - Ink Teal is for text, icons, and primary CTA buttons only

2. **Sidebar + page must look light and airy**:
   - Sidebar bg: white (`#FFFFFF`)
   - Active nav item: light tint background (`#ECF8F2`) with Ink text/icons, NOT a dark pill
   - Optional: thin left indicator bar using Aqua Teal (`#61C291`)

3. **Surfaces**:
   - Cards: white (`#FFFFFF`)
   - Page backgrounds: very light (`#FBFDFC`)
   - Active states: soft tint (`#ECF8F2`)

### Accessibility

- **Contrast**: Ensure readable contrast (Ink Teal text on light backgrounds meets WCAG AA)
- **Focus**: All interactive elements must have visible focus rings
- **Text**: Never use white text on Aqua Teal or Fresh Green backgrounds (contrast insufficient)

## Implementation Checklist

- [x] CSS variables updated in `frontend/src/shared/styles/index.css`
- [x] Sidebar backgrounds are white
- [x] Active nav items use light tint (`#ECF8F2`), not dark
- [x] No dark teal fills in sidebar or large UI regions
- [x] All hover effects use standardized transitions
- [x] No hover effects change padding, border width, or font-weight
- [x] Icons have fixed containers, no collision with text
- [x] Landing page uses new palette
- [x] Student pages use new palette
- [x] Admin pages use new palette
- [x] Focus-visible rings on all interactive elements

## Key File Paths

### CSS Variables
- `frontend/src/shared/styles/index.css` - Single source of truth for all colors

### Components
- `frontend/src/shared/components/ui/button.jsx` - Button variants
- `frontend/src/shared/components/ui/badge.jsx` - Badge variants
- `frontend/src/shared/components/ui/card.jsx` - Card component

### Sidebars
- `frontend/src/features/dashboard/components/sidebar.jsx` - Student sidebar
- `frontend/src/features/admin/components/sidebar.jsx` - Admin sidebar

### Pages
- `frontend/src/features/landing-page/components/*.jsx` - Landing page
- `frontend/src/features/dashboard/pages/*.jsx` - Student dashboard
- `frontend/src/features/admin/pages/*.jsx` - Admin pages

## Migration Notes

All components automatically use the new palette through CSS variables. No component code changes were needed for color updates - only the CSS variable definitions were modified.

The sidebar active states were updated to use light backgrounds (`#ECF8F2`) instead of dark teal fills, with optional left indicator bars using Aqua Teal.

Hover effects were standardized to use explicit transitions: `transition-[transform,box-shadow,background-color,border-color,color] duration-200 ease-out`.
