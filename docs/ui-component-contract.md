# UI Component Contract

This document defines the design system rules and component usage guidelines for CareerHoop's student-facing interface.

## Button Variants

### Primary (`variant="default"`)
- **Usage**: Main actions, primary CTAs
- **Examples**: "Start Assessment", "Save", "Submit", "Complete Assessment"
- **Styling**: `bg-primary text-primary-foreground hover:bg-primary-hover`
- **When to use**: The most important action on a page or in a section

### Secondary (`variant="secondary"`)
- **Usage**: Secondary actions, alternative options
- **Examples**: "Review", "View Details", "Explore More"
- **Styling**: `border border-secondary bg-secondary/10 text-secondary-foreground hover:bg-secondary/20 hover:border-secondary`
- **Foreground**: Ink text (`text-secondary-foreground`) - **CRITICAL**: Do NOT use white text
- **When to use**: Important but not the primary action

### Destructive (`variant="destructive"`)
- **Usage**: Delete, remove, or destructive actions
- **Examples**: "Delete Account", "Remove from Saved", "Cancel Subscription"
- **Styling**: `bg-destructive text-destructive-foreground hover:bg-destructive/90`
- **When to use**: Actions that permanently delete or remove data

### Ghost (`variant="ghost"`)
- **Usage**: Tertiary actions, icon buttons, subtle interactions
- **Examples**: Icon-only buttons, "Learn More" links, secondary navigation
- **Styling**: `hover:bg-accent hover:text-accent-foreground`
- **When to use**: Less prominent actions that don't need strong visual weight

### Outline (`variant="outline"`)
- **Usage**: Alternative actions, cancel buttons, secondary options
- **Examples**: "Cancel", "Later", "Skip", "Back"
- **Styling**: `border border-border bg-background hover:bg-accent`
- **When to use**: Actions that are alternatives to primary actions

### Link (`variant="link"`)
- **Usage**: Text links, inline actions
- **Examples**: "Learn more", "View all", navigation links
- **Styling**: `text-secondary underline-offset-4 hover:underline hover:text-secondary-hover`
- **When to use**: Inline text actions that should look like links

## Spacing Rules

### Vertical Spacing
- **Between major sections**: `space-y-8` (32px)
  - Use between page sections, major card groups, form sections
- **Within cards**: `space-y-4` (16px)
  - Use for card content, grouped related items
- **Between form fields**: `space-y-2` (8px)
  - Use between label and input, between form groups
- **Tight spacing**: `space-y-1` (4px)
  - Use for related inline elements, badges, tags

### Horizontal Spacing
- **Container padding**: `px-4 sm:px-6 lg:px-8`
  - Standard responsive padding for page containers
- **Card padding**: `p-6` (24px)
  - Standard padding for CardContent
- **Grid gaps**: `gap-6` (24px) for card grids, `gap-4` (16px) for form grids

## Border Radius Rules

- **Buttons**: `rounded-md` (6px)
- **Cards**: `rounded-xl` (12px)
- **Badges**: `rounded-full` (fully rounded)
- **Inputs**: `rounded-md` (6px)
- **Modals/Dialogs**: `rounded-xl` (12px)

## Color Usage

See [Brand Theme Light Documentation](./brand-theme-light.md) for complete palette details.

### Primary (Brand Ink - #0f4e56)
- **Usage**: Main actions, primary CTAs, active states, headings, icons
- **Token**: `bg-primary`, `text-primary`, `border-primary`
- **When to use**: The most important interactive elements, primary buttons
- **Foreground**: Use `text-primary-foreground` (white) on primary backgrounds - **21:1 contrast (WCAG AAA)**
- **CRITICAL**: Primarily for text and high-contrast CTAs, NOT as large page backgrounds

### Secondary (Brand Aqua Teal - #4ab9a4)
- **Usage**: Main brand color, accents, outlines, secondary buttons, info states
- **Token**: `bg-secondary`, `text-secondary`, `bg-info`, `text-info`
- **When to use**: Secondary CTAs, info messages, brand accents, outlines
- **Foreground**: Use `text-secondary-foreground` (Ink text) on secondary backgrounds
- **CRITICAL**: Do NOT use white text on Aqua background (contrast: 2.8:1, fails WCAG AA)

### Success (Brand Success Lime - #9edb69)
- **Usage**: Success states, badges, check indicators, positive highlights, progress
- **Token**: `bg-success`, `text-success`, `text-success-foreground`
- **When to use**: Success messages, completion indicators, correct answers
- **Foreground**: Use `text-success-foreground` (Ink text) on success backgrounds
- **CRITICAL**: Do NOT use white text on Success Lime (contrast: 1.8:1, fails WCAG AA)

### Warning/Highlight (Brand Highlight Lime - #daf135)
- **Usage**: Warning states, saved/bookmarked indicators, pending items
- **Token**: `bg-warning`, `text-warning`, `text-warning-foreground`
- **When to use**: Warning badges, saved state indicators, small highlights
- **Critical**: Always use with Ink text (`text-warning-foreground`) for WCAG AA compliance
- **CRITICAL**: Small highlights only - never use for large backgrounds

### Accent (Brand Soft Mint - #def0bd)
- **Usage**: Soft backgrounds, subtle gradient starts, accent backgrounds, hero gradients
- **Token**: `bg-accent`, `text-accent`, `text-accent-foreground`
- **When to use**: Soft UI elements, ghost button hovers, subtle highlights, light gradients
- **Foreground**: Use `text-accent-foreground` (Ink text) on accent backgrounds

### Muted (Brand Muted Slate-Teal - #517679)
- **Usage**: Secondary text, borders, disabled states, placeholders
- **Token**: `text-muted-foreground`, `bg-muted`, `border-strong`
- **When to use**: Helper text, descriptions, disabled elements, borders

### Destructive (Red)
- **Usage**: Errors, delete actions, critical warnings
- **Token**: `bg-destructive`, `text-destructive`, `bg-error`, `text-error`
- **When to use**: Error messages, delete buttons, critical alerts

## Animation Rules

### Duration
- **Page transitions**: 0.28s (from motion tokens)
- **Card animations**: 0.4-0.6s with staggered delays (0.1s per item)
- **Hover effects**: **200ms** (`duration-200`) - **Standardized for all interactive elements**
- **Reduced motion**: 0.15s (instant feel)

### Easing
- **Interactive Elements**: `ease-out` (`cubic-bezier(0, 0, 0.2, 1)`) - **Standardized for hover/focus**
- **Page Transitions**: `ease: [0.22, 1, 0.36, 1]` (from motion tokens)
- **Reduced motion**: `ease: "linear"`

### When to Animate
- **Entrance animations**: Use for cards, lists, sections appearing on page load
- **Hover effects**: Prefer `hover:-translate-y-0.5` over scale; if scale is used, keep `<= 1.02` with sufficient spacing
- **Transitions**: Use for step changes, tab switches, modal appearances
- **Always respect**: `prefers-reduced-motion` using `useReducedMotion()` hook

### Transition Properties
- **Explicit only**: Use `transition-[transform,box-shadow,background-color,border-color,color]` - never use `transition-all`
- **Duration**: Always `duration-200 ease-out` for hover/focus states
- **Layout rules**: NO layout shifts - use transform only, no padding/border width changes on hover

### Animation Patterns
```javascript
// Standard entrance
initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={prefersReducedMotion ? { duration: 0.15 } : { duration: 0.6 }}

// Hover effect - Prefer translate-y
whileHover={prefersReducedMotion ? {} : { y: -2 }}

// Card hover - Shadow only, no scale
className="transition-[box-shadow] duration-200 ease-out hover:shadow-lg"
```

## Typography Scale

- **Page titles**: `text-4xl font-bold` (36px)
- **Section headings**: `text-2xl font-bold` (24px)
- **Card titles**: `text-xl font-semibold` (20px)
- **Body text**: `text-base` (16px) - default
- **Small text**: `text-sm` (14px) - descriptions, helper text
- **Caption**: `text-xs` (12px) - labels, metadata

## Container Widths

- **Standard**: `max-w-7xl mx-auto` (1280px max width)
- **Narrow forms**: `max-w-2xl mx-auto` (672px max width) - wrapped in standard container
- **Padding**: Always use `px-4 sm:px-6 lg:px-8` on containers

## Component-Specific Rules

### Cards
- **Border**: `border-2` for highlighted cards, `border` for standard
- **Border Radius**: `rounded-xl` (1rem) - standardized
- **Padding**: `p-6` (24px) - standardized for CardContent
- **Spacing**: `space-y-4` within cards
- **Hover**: `hover:shadow-lg transition-[box-shadow] duration-200 ease-out hover:-translate-y-0.5`
- **No layout shifts**: Use transform (translate-y) instead of scale; ensure icons have `shrink-0`

### Forms
- **Label spacing**: `space-y-2` between label and input
- **Field spacing**: `space-y-2` between form fields
- **Helper text**: `text-sm text-muted-foreground`
- **Error messages**: Use Alert component with `variant="destructive"`

### Badges
- **Size**: `text-sm px-3 py-1`
- **Shape**: `rounded-full`
- **Variants**: Use semantic variants (default, primary, secondary, accent, outline)

### Progress Indicators
- **Height**: `h-2` for progress bars
- **Label format**: "X% Complete"
- **Use**: Progress component consistently

## Accessibility

- **Focus states**: All interactive elements must have visible focus rings
- **Keyboard navigation**: Logical tab order, keyboard traps in modals
- **ARIA labels**: Required for icon-only buttons
- **Color contrast**: Ensure WCAG AA compliance (4.5:1 for text)
- **Motion preferences**: Always respect `prefers-reduced-motion`

## Responsive Breakpoints

- **Mobile**: 320px+ (base styles)
- **Tablet**: 768px+ (`md:` prefix)
- **Desktop**: 1024px+ (`lg:` prefix)
- **Large desktop**: 1280px+ (`xl:` prefix)

## Empty States

- **Component**: Always use `EmptyState` component
- **Required props**: `icon`, `title`, `description`
- **Optional**: `action` prop for CTA button
- **Variants**: Use appropriate variant (default, search, error)

