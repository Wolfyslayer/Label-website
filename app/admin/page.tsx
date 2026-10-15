import Link from "next/link";

export default function AdminStaticNoticePage() {
  return (
    <article className="space-y-6 text-sm leading-relaxed text-text-secondary">
      <h1 className="font-display text-3xl text-text-primary">CMS not available on static hosting</h1>
      <p>
        This site is built for <strong className="text-text-primary">GitHub Pages</strong> (static HTML).
        The Supabase admin panel, server actions, media uploads, and{" "}
        <code className="text-silver">/api/contact</code> require a Node.js server.
      </p>
      <section className="space-y-3 rounded-sm border border-border-subtle bg-void/40 p-5">
        <h2 className="font-display text-lg text-text-primary">Update content on GitHub Pages</h2>
        <ul className="list-inside list-disc space-y-2">
          <li>Edit <code className="text-silver">lib/data/seed.ts</code> and redeploy, or</li>
          <li>
            Set Supabase env vars in GitHub Actions so content is fetched at{" "}
            <strong className="text-text-primary">build time</strong> (read-only on the live site).
          </li>
        </ul>
      </section>
      <section className="space-y-3 rounded-sm border border-border-subtle bg-void/40 p-5">
        <h2 className="font-display text-lg text-text-primary">Run the full CMS locally or on Node</h2>
        <p>
          Copy <code className="text-silver">server-routes/cms-admin/</code> into{" "}
          <code className="text-silver">app/admin/</code>, restore{" "}
          <code className="text-silver">server-routes/api</code> and{" "}
          <code className="text-silver">middleware.example.ts</code> — see{" "}
          <code className="text-silver">server-routes/README.md</code>.
        </p>
        <p>
          Use <code className="text-silver">npm run build:node</code> for a server production build (not
          GitHub Pages).
        </p>
      </section>
      <p>
        <Link href="/en/contact/" className="text-accent hover:text-text-primary">
          Contact page →
        </Link>{" "}
        for inquiries. No service role or webhook secrets are embedded in this static bundle.
      </p>
    </article>
  );
}
