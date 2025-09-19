import * as React from "react";
import { cn } from "@/lib/utils";

interface PixelProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
}

const PixelProgress = React.forwardRef<HTMLDivElement, PixelProgressProps>(
  ({ className, value = 0, max = 100, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div
        ref={ref}
        className={cn("progress-pixel", className)}
        {...props}
      >
        <div 
          className="progress-pixel-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
PixelProgress.displayName = "PixelProgress";

export { PixelProgress };