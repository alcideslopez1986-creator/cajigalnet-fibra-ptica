import { Button } from "@/components/ui/button";
import type { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";
import type * as React from "react";

type ActionButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    fullWidth?: boolean;
    asChild?: boolean;
  };

/** Primary CTA: gradient pill with lifted shadow and tactile press. */
export function PrimaryButton({
  className,
  fullWidth = true,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      className={cn(
        "h-12 rounded-2xl bg-gradient-primary font-semibold text-primary-foreground shadow-primary-lift press-tactile hover:brightness-110",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

/** Secondary action: outlined card surface. */
export function SecondaryButton({
  className,
  fullWidth = true,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="outline"
      className={cn(
        "h-12 rounded-2xl border-border bg-card font-semibold text-foreground press-tactile hover:border-primary/40 hover:bg-card",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}

export function DangerButton({
  className,
  fullWidth = true,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant="destructive"
      className={cn(
        "h-12 rounded-2xl font-semibold press-tactile",
        fullWidth && "w-full",
        className,
      )}
      {...props}
    />
  );
}
