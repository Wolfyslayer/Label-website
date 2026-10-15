import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <Container className="flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-text-muted">404</p>
        <h1 className="mt-4 font-display text-4xl">Page not found</h1>
        <p className="mt-4 max-w-md text-sm text-text-secondary">
          The page you requested is not available. Explore the catalog or return home.
        </p>
        <div className="mt-8 flex gap-4">
          <Button href="/">Home</Button>
          <Button href="/music" variant="outline">
            Music
          </Button>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
