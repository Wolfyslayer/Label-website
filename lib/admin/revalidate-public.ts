import { revalidatePath } from "next/cache";

/** Revalidate localized public routes after CMS writes. */
export function revalidatePublicContent() {
  const paths = [
    "/",
    "/artists",
    "/music",
    "/releases",
    "/upcoming",
    "/news",
    "/about",
    "/contact",
    "/press",
  ];
  for (const locale of ["en", "sv"] as const) {
    for (const path of paths) {
      revalidatePath(`/${locale}${path === "/" ? "" : path}`);
    }
  }
  revalidatePath("/sitemap.xml");
}
