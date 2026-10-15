import { AlertTriangle } from "lucide-react";

export function DisclaimerBanner() {
  return (
    <div
      className="border-b border-wolf/30 bg-wolf/10 px-4 py-4 text-sm leading-relaxed text-text-secondary"
      role="note"
    >
      <div className="mx-auto flex max-w-3xl gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-wolf-glow" aria-hidden />
        <div>
          <p className="font-medium text-text-primary">Public browser tool — not a private admin</p>
          <p className="mt-1">
            This Music Manager runs entirely on your device. It does not log in to GitHub, does not publish
            automatically, and is not password-protected. Anyone with the link can open the editor. Export files
            and upload them to the repository manually. Draft content stays in your browser until you export.
          </p>
        </div>
      </div>
    </div>
  );
}
