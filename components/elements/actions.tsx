"use client";

import type { ComponentProps } from \"react\";
import { Button } from \"@/components/ui/button\";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from \"@/components/ui/tooltip\";
import { cn } from \"@/lib/utils\";

/**
 * Props for the Actions component, extending standard div props.
 */
export type ActionsProps = ComponentProps<\"div\">;

/**
 * A container component for action buttons, arranging them in a flex row with small gaps.
 * This component is designed to group related action buttons together for better UX.
 *
 * @example
 * <Actions>
 *   <Action tooltip=\"Edit\">Edit Icon</Action>
 *   <Action tooltip=\"Delete\">Delete Icon</Action>
 * </Actions>
 *
 * @param {ActionsProps} props - The props for the underlying div element.
 * @param {string} [props.className] - Additional CSS classes to apply.
 * @param {React.ReactNode} props.children - The action buttons or other children to render.
 * @returns {JSX.Element} A div element containing the provided children with flex layout.
 */
export const Actions = ({ className, children, ...props }: ActionsProps) => (
  <div className={cn(\"flex items-center gap-0.5\", className)} {...props}>
    {children}
  </div>
);

/**
 * Props for the Action component, extending Button props with additional accessibility features.
 * @typedef {ComponentProps<typeof Button> & {
 *   tooltip?: string;
 *   label?: string;
 * }} ActionProps
 */
export type ActionProps = ComponentProps<typeof Button> & {
  tooltip?: string;
  label?: string;
};

/**
 * An individual action button component with built-in support for tooltips and screen reader labels.
 * This component enhances standard buttons with hover tooltips and ensures accessibility.
 *
 * @example
 * <Action tooltip=\"Copy to clipboard\" label=\"Copy\" onClick={handleCopy}>
 *   <CopyIcon />
 * </Action>
 *
 * @param {ActionProps} props - The props for the action button.
 * @param {string} [props.tooltip] - The text to display in the tooltip on hover.
 * @param {string} [props.label] - The label for screen readers, defaults to tooltip if not provided.
 * @param {React.ReactNode} props.children - The content of the button, typically an icon.
 * @param {\"ghost\" | \"default\" | \"destructive\" | \"link\" | \"outline\" | \"secondary\"} [props.variant=\"ghost\"] - The button variant.
 * @param {\"sm\" | \"lg\" | \"default\" | null} [props.size=\"sm\"] - The button size.
 * @param {() => void} [props.onClick] - The click handler.
 * @returns {JSX.Element} The button element, optionally wrapped in a Tooltip.
 */
export const Action = ({
  tooltip,
  children,
  label,
  className,
  variant = \"ghost\",
  size = \"sm\",
  ...props
}: ActionProps) => {
  const button = (
    <Button
      className={cn(
        \"relative size-9 p-1.5 text-muted-foreground hover:text-foreground\",
        className
      )}
      size={size}
      type=\"button\"
      variant={variant}
      data-testid=\"action-button\"
      {...props}
    >
      {children}
      <span className=\"sr-only\">{label || tooltip}</span>
    </Button>
  );

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};
