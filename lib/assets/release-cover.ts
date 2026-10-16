import manifest from "@/lib/assets/release-cover-manifest.json";

/** Returns locally generated cover derivatives only when they are present in the committed manifest. */
export function getOptimizedReleaseCover(slug: string): { src: string; srcSet: string } | null {
  if (!Object.prototype.hasOwnProperty.call(manifest, slug)) return null;
  const base = `/assets/releases/${slug}`;
  return {
    src: `${base}-480.webp`,
    srcSet: `${base}-240.webp 240w, ${base}-480.webp 480w, ${base}-640.webp 640w`,
  };
}
