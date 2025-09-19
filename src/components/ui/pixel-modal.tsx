import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const PixelModal = DialogPrimitive.Root;

const PixelModalTrigger = DialogPrimitive.Trigger;

const PixelModalPortal = DialogPrimitive.Portal;

const PixelModalClose = DialogPrimitive.Close;

const PixelModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
PixelModalOverlay.displayName = DialogPrimitive.Overlay.displayName;

const PixelModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <PixelModalPortal>
    <PixelModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] modal-pixel p-pixel duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:max-w-[425px]",
        className
      )}
      {...props}
    >
      {children}
      <PixelModalClose className="absolute right-4 top-4 opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </PixelModalClose>
    </DialogPrimitive.Content>
  </PixelModalPortal>
));
PixelModalContent.displayName = DialogPrimitive.Content.displayName;

const PixelModalHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col gap-1.5 text-center sm:text-left", className)}
    {...props}
  />
);
PixelModalHeader.displayName = "PixelModalHeader";

const PixelModalFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end gap-2", className)}
    {...props}
  />
);
PixelModalFooter.displayName = "PixelModalFooter";

const PixelModalTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-pixel-lg text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
PixelModalTitle.displayName = DialogPrimitive.Title.displayName;

const PixelModalDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
PixelModalDescription.displayName = DialogPrimitive.Description.displayName;

export {
  PixelModal,
  PixelModalPortal,
  PixelModalOverlay,
  PixelModalClose,
  PixelModalTrigger,
  PixelModalContent,
  PixelModalHeader,
  PixelModalFooter,
  PixelModalTitle,
  PixelModalDescription,
};