import { Button } from "@/components/ui/button";
import { mailtoHref } from "@/lib/config/public-contact";
import { cn } from "@/lib/utils/cn";

export function ContactEmailCta({
  email,
  sendLabel,
  className,
}: {
  email: string;
  sendLabel: string;
  className?: string;
}) {
  const href = mailtoHref(email);
  return (
    <div className={cn("space-y-4", className)}>
      <a
        href={href}
        className="block break-all font-display text-xl text-accent transition-colors hover:text-text-primary sm:text-2xl"
      >
        {email}
      </a>
      <Button href={href} variant="primary" size="lg" className="w-full sm:w-auto">
        {sendLabel}
      </Button>
    </div>
  );
}
