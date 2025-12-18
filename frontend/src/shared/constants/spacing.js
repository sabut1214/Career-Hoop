/**
 * Spacing constants for consistent layout spacing
 * All values are in Tailwind spacing units (1 unit = 0.25rem = 4px)
 */

export const SPACING = {
  // Section spacing (between major sections)
  section: "space-y-6", // 24px
  
  // Card internal spacing
  card: "space-y-4", // 16px
  
  // Form field spacing
  form: "space-y-2", // 8px
  
  // Tight spacing (for related items)
  tight: "space-y-1", // 4px
  
  // Padding values
  padding: {
    section: "p-6", // 24px
    card: "p-4", // 16px
    form: "p-2", // 8px
  },
  
  // Gap values (for flex/grid)
  gap: {
    large: "gap-6", // 24px
    medium: "gap-4", // 16px
    small: "gap-2", // 8px
    tight: "gap-1", // 4px
  },
}

