"use client";

import { Button } from "@/components/ui/button";
import { Check, Copy, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export function ReleaseHubActions({
  shareUrl,
  shareTitle,
}: {
  shareUrl: string;
  shareTitle: string;
}) {
  const t = useTranslations("releaseHub");
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const onCopy = useCallback(async () => {
    setShareError(null);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setShareError(t("copyFailed"));
    }
  }, [shareUrl, t]);

  const onShare = useCallback(async () => {
    setShareError(null);
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await onCopy();
  }, [onCopy, shareTitle, shareUrl]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <Button type="button" variant="secondary" className="min-h-12 gap-2" onClick={onShare}>
        <Share2 className="h-4 w-4" aria-hidden />
        {t("share")}
      </Button>
      <Button type="button" variant="outline" className="min-h-12 gap-2" onClick={onCopy}>
        {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
        {copied ? t("copied") : t("copyLink")}
      </Button>
      {shareError ? (
        <p className="text-sm text-danger" role="alert">
          {shareError}
        </p>
      ) : null}
    </div>
  );
}
