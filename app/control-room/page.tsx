import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { Track } from "@/lib/types/content";
import ControlRoom from "./ControlRoomClient";

export default function Page() {
  const dir = join(process.cwd(), "content", "tracks");
  const tracks = readdirSync(dir).filter(file => file.endsWith(".json")).map(file =>
    JSON.parse(readFileSync(join(dir, file), "utf8")) as Track
  ).sort((a,b) => a.title.localeCompare(b.title));
  return <ControlRoom tracks={tracks} />;
}
