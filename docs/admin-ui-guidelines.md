# Admin Panel UI Guidelines

**Last Updated**: 2025-01-XX  
**Purpose**: Quick reference guide for maintaining consistent UI/UX across the CareerHoop Admin Panel

## Chart Palette

### Standard Chart Colors
All charts use CSS custom properties from the theme:

- `--chart-1`: Primary chart color (blue) - Used for main metrics
- `--chart-2`: Secondary chart color (green) - Used for secondary metrics
- `--chart-3`: Tertiary chart color (purple) - Used for additional data series
- `--chart-4`: Quaternary chart color - Used for supplementary data
- `--chart-5`: Quinary chart color - Used for additional data series

### Usage Rules
1. **Always use CSS vars**: `fill="var(--chart-1)"` not hardcoded colors
2. **Consistent mapping**: Map data types to chart colors consistently across all charts
3. **Accessibility**: Ensure sufficient contrast (WCAG AA compliant)
4. **Dark mode**: Chart colors automatically adapt via theme

### Chart Color Mapping (Standard)
- User Registrations: `--chart-1`
- Career Creations: `--chart-2`
- College Creations: `--chart-3`
- Training Creations: `--chart-4`
- Quiz Completions: `--chart-5`

## Card Layout

### Standard Card Structure
```jsx
<Card className="border-2">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

### Card Styling Rules
1. **Border**: Always use `border-2` for admin cards (not default `border`)
2. **Padding**: Card component handles padding automatically
3. **Spacing**: Use `space-y-6` for multiple cards in a container
4. **Max Width**: Use `max-w-7xl mx-auto` for page containers

### Card Variants
- **Standard Card**: `border-2` with default styling
- **Metric Card**: Stat cards with icon, value, and optional growth indicator
- **Chart Card**: Cards containing charts with consistent heights
- **Table Card**: Cards containing data tables

### Metric Card Pattern
```jsx
<Card className="border-2">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">{label}</CardTitle>
    <div className="p-2 rounded-lg bg-primary/10 text-primary">
      <Icon className="h-5 w-5" />
    </div>
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">{value}</div>
    <p className="text-xs text-muted-foreground mt-1">Description</p>
  </CardContent>
</Card>
```

## Table Layout

### Standard Table Structure
```jsx
<Card className="border-2">
  <CardHeader>
    <CardTitle>Table Title</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="overflow-x-auto">
      <table className="w-full text-sm" aria-busy={loading}>
        <thead className="border-b">
          <tr>
            <th className="text-left py-3 px-4 font-semibold">Column</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b transition-colors hover:bg-muted/50 cursor-pointer">
            <td className="py-3 px-4">Data</td>
          </tr>
        </tbody>
      </table>
    </div>
    <Pagination />
  </CardContent>
</Card>
```

### Table Styling Rules
1. **Header**: `text-left py-3 px-4 font-semibold` for all headers
2. **Rows**: `border-b transition-colors hover:bg-muted/50 cursor-pointer`
3. **Cells**: `py-3 px-4` for consistent padding
4. **Actions Column**: `text-right space-x-2` for action buttons
5. **Loading States**: Use `TableRowSkeleton` component
6. **Empty States**: Use `EmptyState` component in table body

### Action Buttons
```jsx
<Button
  variant="ghost"
  size="sm"
  className="text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  aria-label="Action description"
>
  <Icon className="h-4 w-4" />
</Button>
```

### Table Requirements
- **Focus Rings**: All interactive elements must have `focus-visible:ring-2`
- **ARIA Labels**: All action buttons need descriptive `aria-label`
- **Hover States**: Rows use `hover:bg-muted/50` for visibility
- **Pagination**: Centered with `justify-center`, includes focus rings

## Chart Styling

### Standard Chart Heights
- **Main Charts**: `h-[300px]` for primary dashboard charts
- **Secondary Charts**: `h-[250px]` for supporting charts
- **Compact Charts**: `h-[200px]` for smaller visualizations

### Axis Styling
```jsx
<XAxis 
  dataKey="date" 
  tick={{ fontSize: 12 }}
  label={{ 
    value: "Date", 
    position: "insideBottom", 
    offset: -5, 
    style: { textAnchor: "middle", fontSize: 12 } 
  }}
/>
<YAxis 
  tick={{ fontSize: 12 }} 
  label={{ 
    value: "Count", 
    angle: -90, 
    position: "insideLeft", 
    style: { textAnchor: "middle", fontSize: 12 } 
  }}
/>
```

### Chart Requirements
1. **Axis Labels**: Always include axis labels with consistent styling
2. **Tick Formatting**: `fontSize: 12` for all ticks
3. **Legend**: Use `ChartLegend` with `wrapperStyle={{ paddingTop: "20px" }}`
4. **Empty States**: Show helpful message when data is empty
5. **Tooltips**: Use `ChartTooltip` with `ChartTooltipContent`

### Empty State Pattern
```jsx
{chartData.length === 0 ? (
  <div className="flex flex-col items-center justify-center h-[300px] text-center space-y-2">
    <BarChart3 className="h-12 w-12 text-muted-foreground" />
    <p className="text-sm font-medium text-foreground">No data in selected range</p>
    <p className="text-xs text-muted-foreground">Try selecting a different time period</p>
  </div>
) : (
  <ChartContainer>...</ChartContainer>
)}
```

## Color Usage

### Theme Tokens (Always Use)
- **Primary**: `bg-primary/10 text-primary` for primary actions/indicators
- **Secondary**: `bg-secondary/10 text-secondary` for secondary elements
- **Success**: `bg-success/10 text-success` for positive states
- **Warning**: `bg-warning/10 text-warning` for warning states
- **Error**: `bg-error/10 text-error` for error states
- **Accent**: `bg-accent/10 text-accent` for accent elements

### Status Colors
- **HEALTHY**: `bg-success/10 text-success`
- **WARNING**: `bg-warning/10 text-warning`
- **CRITICAL**: `bg-error/10 text-error`

### Never Use
- ❌ Hardcoded colors: `bg-blue-100`, `text-green-600`, etc.
- ❌ Non-standard classes: `bg-info/20` (info doesn't exist in theme)
- ❌ Inline styles for colors

## Typography

### Heading Hierarchy
- **Page Title**: `text-3xl font-bold` (H1)
- **Page Subtitle**: `text-muted-foreground mt-1`
- **Card Title**: `font-semibold` (default CardTitle styling)
- **Section Headers**: `text-lg font-semibold`

### Text Sizes
- **Body**: Default (1rem)
- **Small**: `text-sm`
- **Caption**: `text-xs`
- **Muted Text**: `text-muted-foreground`

## Spacing

### Standard Spacing
- **Page Container**: `max-w-7xl mx-auto space-y-6`
- **Card Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6`
- **Card Content**: Automatic via Card component
- **Table Padding**: `py-3 px-4` for cells, `py-3 px-4` for headers

## Accessibility

### Focus States
All interactive elements must include:
```jsx
className="... focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
```

### ARIA Labels
- **Action Buttons**: `aria-label="Action description"`
- **Pagination**: `aria-label="Go to page X"`, `aria-current="page"` for current
- **Tables**: `aria-busy={loading}` on table element
- **Form Inputs**: Proper `htmlFor` and `id` associations

### Keyboard Navigation
- All interactive elements must be keyboard accessible
- Tab order should be logical
- Focus indicators must be visible

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 768px)
- **Tablet**: `md:` (≥ 768px)
- **Desktop**: `lg:` (≥ 1024px)

### Grid Patterns
- **Dashboard Stats**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- **Two Column**: `grid-cols-1 lg:grid-cols-2`
- **Three Column**: `grid-cols-1 md:grid-cols-3`

### Mobile Considerations
- Tables scroll horizontally: `overflow-x-auto`
- Sidebar collapses on mobile
- Cards stack vertically on mobile
- Touch targets minimum 44x44px

## Quick Actions

### Button Styling
```jsx
<Button
  variant="outline"
  className="flex flex-col items-center justify-center h-20 gap-2 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-primary"
>
  <Icon className="h-5 w-5" />
  <span className="text-xs font-medium">Label</span>
</Button>
```

### Color Mapping
- Add Student: `bg-primary/10 text-primary`
- Add Career: `bg-secondary/10 text-secondary`
- Add College: `bg-accent/10 text-accent`
- Add Training: `bg-warning/10 text-warning`

## Status Badges

### Badge Pattern
```jsx
<span className="px-2 py-1 rounded-md text-xs font-medium bg-success/10 text-success">
  Status
</span>
```

### Status Variants
- **Default/Success**: `bg-success/10 text-success`
- **Destructive/Error**: `bg-error/10 text-error`
- **Warning**: `bg-warning/10 text-warning`

## Empty States

### Standard Empty State
```jsx
<EmptyState
  icon={Icon}
  title="No Items Found"
  description="Helpful description with context"
  action={{
    label: "Action Button",
    onClick: handler,
    variant: "default"
  }}
/>
```

### Chart Empty State
```jsx
<div className="flex flex-col items-center justify-center h-[300px] text-center space-y-2">
  <Icon className="h-12 w-12 text-muted-foreground" />
  <p className="text-sm font-medium text-foreground">No data message</p>
  <p className="text-xs text-muted-foreground">Helpful context</p>
</div>
```

## Best Practices

1. **Consistency First**: Always use existing patterns before creating new ones
2. **Theme Tokens**: Never hardcode colors, always use theme tokens
3. **Accessibility**: Include focus rings and ARIA labels on all interactive elements
4. **Responsive**: Test on mobile, tablet, and desktop
5. **Loading States**: Always show loading states, never leave users guessing
6. **Empty States**: Provide helpful empty states, not just "No data"
7. **Error Handling**: Show user-friendly error messages
8. **Performance**: Use skeleton loaders for better perceived performance

## Common Patterns

### Search Bar Layout
```jsx
<Card className="border-2">
  <CardHeader>
    <CardTitle>Search Items</CardTitle>
  </CardHeader>
  <CardContent>
    <Input
      placeholder="Search by name or email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  </CardContent>
</Card>
```

### Page Header
```jsx
<div className="flex items-center justify-between">
  <div>
    <h1 className="text-3xl font-bold">Page Title</h1>
    <p className="text-muted-foreground mt-1">Page description</p>
  </div>
  <Button onClick={handleAction}>
    <Icon className="h-4 w-4" />
    Action
  </Button>
</div>
```

---

**Note**: These guidelines are living documentation. Update as patterns evolve while maintaining consistency with the design system.

