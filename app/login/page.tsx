import { login } from "@/actions/auth";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/";
  const hasError = params.error === "1";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-3xl mb-1">Bloom Daily</p>
        <p className="text-sm mb-8" style={{ color: "var(--color-ink-muted)" }}>
          Routines, tasks, journal and time, kept in one place.
        </p>

        <form action={login} className="space-y-3">
          <input type="hidden" name="next" value={next} />
          <label className="block">
            <span className="block text-sm mb-1.5" style={{ color: "var(--color-ink-muted)" }}>
              Password
            </span>
            <input
              type="password"
              name="password"
              autoFocus
              required
              className="w-full rounded-md px-3 py-2 text-sm border"
              style={{ borderColor: "var(--color-line)" }}
            />
          </label>

          {hasError && (
            <p className="text-sm" style={{ color: "var(--color-rust)" }}>
              That password isn&apos;t right. Try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md py-2 text-sm font-medium mt-2"
            style={{ background: "var(--color-accent)", color: "var(--color-accent-ink)" }}
          >
            Enter
          </button>
        </form>
      </div>
    </main>
  );
}
