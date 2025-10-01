import { cn } from "@/lib/utils";

interface GradientOrbProps {
  className?: string;
  color: string;
  size?: "small" | "medium" | "large";
  delay?: string;
}

export const GradientOrb = ({ 
  className, 
  color, 
  size = "large",
  delay = "0s"
}: GradientOrbProps) => {
  const sizeClasses = {
    small: "w-[300px] h-[300px]",
    medium: "w-[500px] h-[500px]",
    large: "w-[800px] h-[800px]"
  };

  return (
    <div
      className={cn(
        "absolute rounded-full blur-3xl opacity-30 animate-gradient-shift",
        `bg-gradient-to-br ${color}`,
        sizeClasses[size],
        className
      )}
      style={{ animationDelay: delay }}
    />
  );
};