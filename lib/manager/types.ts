import type { z } from "zod";
import type {
  artistSourceSchema,
  newsFrontmatterSchema,
  releaseSourceSchema,
  trackSchema,
} from "@/lib/content/schemas";

export type ReleaseForm = z.infer<typeof releaseSourceSchema>;
export type TrackForm = z.infer<typeof trackSchema>;
export type ArtistForm = z.infer<typeof artistSourceSchema>;
export type NewsForm = z.infer<typeof newsFrontmatterSchema>;

export type ArtistKey = "frostmark" | "wolfyslayer";

export type ArtworkDraft = {
  releaseSlug: string;
  file: File;
  previewUrl: string;
  /** Site path under public/, e.g. /assets/releases/my-single/cover.webp */
  publicPath: string;
};

export type ManagerWorkspace = {
  releases: ReleaseForm[];
  tracks: TrackForm[];
  artists: ArtistForm[];
  news: NewsForm[];
  artwork: ArtworkDraft[];
};

export type ImportResult = {
  kind: "release" | "track" | "artist" | "news" | "unknown";
  name: string;
  added: boolean;
  message: string;
};

export type ValidationIssue = { field: string; message: string };

export type ExportManifestEntry = {
  path: string;
  description: string;
};
