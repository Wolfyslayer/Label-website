"use client";

import { uploadAdminMedia } from "@/lib/admin/media";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";

export function MediaUploadField({
  label,
  folder,
  urlFieldName,
  defaultUrl,
  hint,
}: {
  label: string;
  folder: string;
  urlFieldName: string;
  defaultUrl?: string;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  async function onUpload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose an image file first");
      return;
    }
    setUploading(true);
    setError(null);
    setStatus(null);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("folder", folder);
    const result = await uploadAdminMedia(fd);
    setUploading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.url) {
      setUrl(result.url);
      setStatus(result.message);
    }
  }

  return (
    <div className="space-y-3 rounded-sm border border-border-subtle p-4">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      {hint ? <p className="text-xs text-text-muted">{hint}</p> : null}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="block w-full text-sm" />
      <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={onUpload}>
        {uploading ? "Uploading…" : "Upload & optimize"}
      </Button>
      <Input label="Image URL" name={urlFieldName} value={url} onChange={(e) => setUrl(e.target.value)} required />
      <FormStatusInline error={error} success={status} />
    </div>
  );
}

function FormStatusInline({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null;
  return (
    <p className={`text-xs ${error ? "text-danger" : "text-success"}`} role={error ? "alert" : "status"}>
      {error ?? success}
    </p>
  );
}
