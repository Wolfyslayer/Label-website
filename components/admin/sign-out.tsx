"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

export function AdminSignOut({ className }: { className?: string }) {
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(className)}
      onClick={async () => {
        const supabase = createClient();
        if (supabase) await supabase.auth.signOut();
        router.push("/admin/login");
        router.refresh();
      }}
    >
      Sign out
    </Button>
  );
}
