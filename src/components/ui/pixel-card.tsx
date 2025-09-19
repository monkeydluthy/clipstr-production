import * as React from "react";
import { cn } from "@/lib/utils";

const PixelCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("card-pixel p-pixel", className)}
    {...props}
  />
));
PixelCard.displayName = "PixelCard";

const PixelCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 p-pixel", className)} {...props} />
));
PixelCardHeader.displayName = "PixelCardHeader";

const PixelCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-pixel-lg text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
PixelCardTitle.displayName = "PixelCardTitle";

const PixelCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
PixelCardDescription.displayName = "PixelCardDescription";

const PixelCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-pixel pt-0", className)} {...props} />
));
PixelCardContent.displayName = "PixelCardContent";

const PixelCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center p-pixel pt-0", className)} {...props} />
));
PixelCardFooter.displayName = "PixelCardFooter";

export {
  PixelCard,
  PixelCardHeader,
  PixelCardFooter,
  PixelCardTitle,
  PixelCardDescription,
  PixelCardContent,
};