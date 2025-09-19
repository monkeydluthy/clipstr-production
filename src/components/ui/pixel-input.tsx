import * as React from "react";
import { cn } from "@/lib/utils";

export interface PixelInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PixelInput = React.forwardRef<HTMLInputElement, PixelInputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn("input-pixel", className)}
        ref={ref}
        {...props}
      />
    );
  }
);
PixelInput.displayName = "PixelInput";

export { PixelInput };