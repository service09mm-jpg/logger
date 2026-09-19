import type { ComponentProps } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-foreground text-background hover:opacity-90 disabled:opacity-40",
  secondary:
    "border border-line bg-surface text-foreground hover:border-foreground/30",
  ghost: "text-muted hover:text-foreground",
  danger: "border border-line text-red-600 hover:border-red-400",
};

/**
 * Кнопка. Приймає всі звичайні атрибути <button> — тому її можна віддати
 * формі як `type="submit"` або повісити `formAction`.
 */
export function Button({
  variant = "secondary",
  className = "",
  ...buttonProps
}: ComponentProps<"button"> & { variant?: ButtonVariant }): React.ReactElement {
  return (
    <button
      {...buttonProps}
      className={`rounded-lg px-4 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
    />
  );
}
