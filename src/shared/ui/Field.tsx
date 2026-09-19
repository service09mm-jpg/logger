import type { ReactNode } from "react";

/** Підпис над полем форми. Уся форма застосунку зібрана з цих блоків. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}): React.ReactElement {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {children}
      {hint === undefined ? null : (
        <span className="text-xs text-muted">{hint}</span>
      )}
    </label>
  );
}

/** Спільні класи для <input> і <select>, щоб поля не розповзались стилями. */
export const FIELD_CLASSES =
  "rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-foreground/40";
