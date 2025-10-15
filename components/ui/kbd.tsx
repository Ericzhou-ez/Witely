import { cn } from "@/lib/utils"

/**
 * A component for displaying a single keyboard key.
 * 
 * @param {React.ComponentProps&lt;"kbd"&gt;} props - The standard HTML kbd element props.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @returns {JSX.Element} The rendered Kbd element.
 * @example
 * &lt;Kbd&gt;Esc&lt;/Kbd&gt;
 */
function Kbd({ className, ...props }: React.ComponentProps&lt;"kbd"&gt;) {
  return (
    &lt;kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground pointer-events-none inline-flex h-5 w-fit min-w-5 select-none items-center justify-center gap-1 rounded-sm px-1 font-sans text-xs font-medium",
        "[&_svg:not([class*='size-'])]:size-3",
        "[[data-slot=tooltip-content]_&]:bg-background/20 [[data-slot=tooltip-content]_&]:text-background dark:[[data-slot=tooltip-content]_&]:bg-background/10",
        className
      )}
      {...props}
    /&gt;
  )
}

/**
 * A component for grouping multiple keyboard keys, such as for shortcuts.
 * 
 * @param {React.ComponentProps&lt;"div"&gt;} props - Props for the container, though it renders as kbd.
 * @param {string} [props.className] - Additional CSS classes to apply to the group.
 * @returns {JSX.Element} The rendered KbdGroup element.
 * @example
 * &lt;KbdGroup&gt;
 *   &lt;Kbd&gt;Ctrl&lt;/Kbd&gt; + &lt;Kbd&gt;C&lt;/Kbd&gt;
 * &lt;/KbdGroup&gt;
 */
function KbdGroup({ className, ...props }: React.ComponentProps&lt;"div"&gt;) {
  return (
    &lt;kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    /&gt;
  )
}

export { Kbd, KbdGroup }
