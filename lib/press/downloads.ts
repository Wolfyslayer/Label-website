import type { PressAsset } from "@/lib/types/content";
import { isValidHttpUrl } from "@/lib/utils/url";

/** Returns a download href only when a real asset is available (no fake downloads). */
export function pressAssetDownloadHref(asset: PressAsset): string | null {
  if (isValidHttpUrl(asset.downloadUrl)) return asset.downloadUrl!.trim();
  if (asset.placeholder) return null;
  if (asset.src.startsWith("http") && isValidHttpUrl(asset.src)) return asset.src;
  if (asset.src.startsWith("/") && !asset.src.endsWith(".svg")) return asset.src;
  return null;
}
