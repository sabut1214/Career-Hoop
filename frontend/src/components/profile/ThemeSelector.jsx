import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Palette, Sun, Moon, Monitor } from "lucide-react"
import { useTheme } from "@/context/ThemeContext"

/**
 * ThemeSelector component allows users to choose their preferred theme.
 * 
 * Features:
 * - Light mode option
 * - Dark mode option
 * - System preference option (follows OS setting)
 * - Theme preference persisted in localStorage via ThemeContext
 * 
 * @returns {JSX.Element} The theme selector component
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Theme
        </CardTitle>
        <CardDescription>Choose your preferred theme</CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={theme} onValueChange={setTheme} className="space-y-3">
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="light" id="light" />
            <Label htmlFor="light" className="flex items-center gap-2 cursor-pointer flex-1">
              <Sun className="h-4 w-4" />
              <span>Light</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="dark" id="dark" />
            <Label htmlFor="dark" className="flex items-center gap-2 cursor-pointer flex-1">
              <Moon className="h-4 w-4" />
              <span>Dark</span>
            </Label>
          </div>
          <div className="flex items-center space-x-2 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer">
            <RadioGroupItem value="system" id="system" />
            <Label htmlFor="system" className="flex items-center gap-2 cursor-pointer flex-1">
              <Monitor className="h-4 w-4" />
              <span>System</span>
            </Label>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  )
}


