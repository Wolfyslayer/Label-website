"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const supabase = createClient();
    if (!supabase) {
      setError("Supabase client not configured.");
      setLoading(false);
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <>
      <h1 className="font-display text-2xl">Admin sign in</h1>
      <p className="mt-2 text-sm text-text-muted">
        Only authorized accounts in <code className="text-text-secondary">admin_users</code> can
        access the dashboard.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <Input label="Email" name="email" type="email" required autoComplete="username" />
        <Input
          label="Password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
        />
        {error ? (
          <p className="text-sm text-danger" role="alert">
            {error}
          </p>
        ) : null}
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </>
  );
}

export default function AdminLoginPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main className="mx-auto max-w-md px-5 py-16">
        <h1 className="font-display text-2xl">Admin login unavailable</h1>
        <p className="mt-4 text-sm text-text-secondary">
          Configure Supabase environment variables to enable authentication. Public pages use seed
          data until the database is connected.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-5 py-16">
      <Suspense fallback={<p className="text-sm text-text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
