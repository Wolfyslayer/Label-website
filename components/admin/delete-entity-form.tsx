"use client";

import type { ActionResult } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormStatus } from "@/components/admin/form-status";
import { useState } from "react";

export function DeleteEntityForm({
  entityLabel,
  slug,
  id,
  deleteAction,
}: {
  entityLabel: string;
  slug: string;
  id: string;
  deleteAction: (formData: FormData) => Promise<ActionResult>;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function action(formData: FormData) {
    setError(null);
    setSuccess(null);
    const result = await deleteAction(formData);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(result.message);
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" className="text-danger hover:text-danger" onClick={() => setOpen(true)}>
        Delete {entityLabel}
      </Button>
    );
  }

  return (
    <form action={action} className="mt-8 space-y-3 rounded-sm border border-danger/30 bg-danger/5 p-4">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="slug" value={slug} />
      <p className="text-sm text-text-secondary">
        Type <strong className="text-text-primary">{slug}</strong> to confirm permanent deletion.
      </p>
      <Input label="Confirm slug" name="confirm" required autoComplete="off" />
      <FormStatus error={error} success={success} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="outline" className="border-danger text-danger">
          Permanently delete
        </Button>
        <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
