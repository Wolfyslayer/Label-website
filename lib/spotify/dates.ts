export type ParsedSpotifyReleaseDate = {
  releaseDate: string;
  releaseAt: string;
  releaseDatePrecision: "year" | "month" | "day";
};

/** Map Spotify release_date + precision to site fields without inventing extra calendar precision. */
export function parseSpotifyReleaseDate(
  releaseDate: string,
  precision: "year" | "month" | "day",
): ParsedSpotifyReleaseDate {
  if (precision === "year") {
    const year = releaseDate.slice(0, 4);
    return {
      releaseDate: `${year}-01-01`,
      releaseAt: `${year}-01-01T00:00:00.000Z`,
      releaseDatePrecision: "year",
    };
  }
  if (precision === "month") {
    const [y, m] = releaseDate.split("-");
    const month = m?.padStart(2, "0") ?? "01";
    return {
      releaseDate: `${y}-${month}-01`,
      releaseAt: `${y}-${month}-01T00:00:00.000Z`,
      releaseDatePrecision: "month",
    };
  }
  const day = releaseDate.slice(0, 10);
  return {
    releaseDate: day,
    releaseAt: `${day}T12:00:00.000Z`,
    releaseDatePrecision: "day",
  };
}
