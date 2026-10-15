import { Container } from "@/components/ui/container";

export function CatalogSkeleton() {
  return (
    <Container className="pb-20 pt-28 md:pb-28">
      <div className="animate-pulse space-y-8">
        <div className="h-4 w-24 rounded bg-surface-elevated" />
        <div className="h-12 max-w-md rounded bg-surface-elevated" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-charcoal" />
          ))}
        </div>
        <div className="album-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-square rounded-sm bg-charcoal" />
              <div className="h-4 w-2/3 rounded bg-surface-elevated" />
              <div className="h-3 w-1/3 rounded bg-surface-elevated" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
