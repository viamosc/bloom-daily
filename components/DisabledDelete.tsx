import { Trash2 } from "lucide-react";

export function DisabledDelete() {
  return (
    <button
      type="button"
      disabled
      title="Deleting isn't available yet"
      aria-disabled="true"
      className="p-1.5 rounded-md cursor-not-allowed opacity-40"
      style={{ color: "var(--color-ink-faint)" }}
    >
      <Trash2 size={15} />
    </button>
  );
}
