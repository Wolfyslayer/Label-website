import Link from "next/link";

export default function AdminLoginStaticPage() {
  return (
    <div className="space-y-4 text-sm text-text-secondary">
      <h1 className="font-display text-2xl text-text-primary">Admin login</h1>
      <p>Authentication is not available on the static GitHub Pages deployment.</p>
      <Link href="/admin/" className="text-accent hover:text-text-primary">
        ← Admin information
      </Link>
    </div>
  );
}
