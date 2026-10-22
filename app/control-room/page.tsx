"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Track } from "@/lib/types/content";
import catalog from "@/content/site.json";

type Pending = { track_id: string; youtube_url: string; updated_at: string };
const client = createClient();
const tracks = (catalog as { tracks?: Track[] }).tracks ?? [];
const validLink = (raw: string) => {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && u.hostname === "music.youtube.com" && u.pathname === "/watch" &&
      /^[A-Za-z0-9_-]{11}$/.test(u.searchParams.get("v") ?? "") && [...u.searchParams.keys()].every(k => k === "v");
  } catch { return false; }
};
export default function ControlRoom() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [artist, setArtist] = useState("all");
  const [query, setQuery] = useState("");
  const [missing, setMissing] = useState(true);
  const [pending, setPending] = useState<Pending[]>([]);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!client) return;
    const refresh = async () => {
      const { data: { user } } = await client.auth.getUser();
      setUserId(user?.id ?? null);
      if (!user) { setAuthorized(false); return; }
      const { data } = await client.from("admin_users").select("user_id").eq("user_id", user.id).maybeSingle();
      setAuthorized(!!data);
    };
    void refresh();
    const { data: { subscription } } = client.auth.onAuthStateChange(() => { void refresh(); });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!client || !authorized) return;
    void client.from("youtube_link_proposals").select("track_id,youtube_url,updated_at").then(({ data }) => setPending(data ?? []));
  }, [authorized]);
  const filtered = useMemo(() => tracks.filter(t =>
    (artist === "all" || t.artistId === artist) &&
    (!missing || !t.youtubeMusicTrackUrl) &&
    (t.title.toLowerCase().includes(query.toLowerCase()) || (t.spotifyTrackId ?? "").includes(query))
  ), [artist, query, missing]);
  const signIn = async (e: React.FormEvent) => {
    e.preventDefault(); if (!client) return;
    setBusy(true); setMessage("");
    const { error } = await client.auth.signInWithPassword({ email, password });
    setPassword(""); setBusy(false);
    if (error) setMessage("Inloggningen misslyckades.");
  };
  const save = async (track: Track) => {
    if (!client || !userId || !authorized) return;
    const url = (editing[track.id] ?? "").trim();
    if (!validLink(url)) { setMessage("Använd en direktlänk: https://music.youtube.com/watch?v=VIDEO_ID"); return; }
    setBusy(true); setMessage("");
    const { error } = await client.from("youtube_link_proposals").upsert({
      track_id: track.id, spotify_track_id: track.spotifyTrackId, youtube_url: url, proposed_by: userId
    }, { onConflict: "track_id" });
    if (error) setMessage("Kunde inte spara förslaget. Kontrollera adminbehörighet och databas.");
    else {
      setPending(p => [...p.filter(x => x.track_id !== track.id), { track_id: track.id, youtube_url: url, updated_at: new Date().toISOString() }]);
      setMessage("Sparat för granskning. Kör GitHub Actions: Apply approved YouTube links för att publicera.");
    }
    setBusy(false);
  };
  if (!client) return <main className="mx-auto max-w-lg p-10"><h1 className="text-2xl font-bold">Control Room</h1><p>Supabase är inte konfigurerat.</p></main>;
  return <main className="mx-auto max-w-6xl min-h-screen p-5 md:p-10 space-y-6">
    <header className="flex items-center justify-between gap-4"><div><p className="text-sm opacity-60">WOLF YSLAYER RECORDS</p><h1 className="text-3xl font-bold">Control Room</h1></div>{userId && <button className="rounded-lg border px-4 py-2" onClick={() => void client.auth.signOut()}>Logga ut</button>}</header>
    {!userId ? <form onSubmit={e => void signIn(e)} className="max-w-md space-y-4 rounded-2xl border p-6"><h2 className="text-xl font-semibold">Säker inloggning</h2><input className="w-full rounded-lg border bg-transparent p-3" type="email" required placeholder="E-post" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)}/><input className="w-full rounded-lg border bg-transparent p-3" type="password" required placeholder="Lösenord" autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)}/><button disabled={busy} className="rounded-lg bg-white px-5 py-3 text-black disabled:opacity-50">Logga in</button></form> :
    !authorized ? <section className="rounded-xl border p-6"><h2 className="font-semibold">Åtkomst nekad</h2><p>Kontot saknar administratörsbehörighet.</p></section> :
    <><section className="grid grid-cols-2 gap-3 md:grid-cols-4">{[["Låtar", tracks.length],["Saknar YouTube", tracks.filter(t=>!t.youtubeMusicTrackUrl).length],["Länkade",tracks.filter(t=>!!t.youtubeMusicTrackUrl).length],["Väntar på publicering",pending.length]].map(([name,n])=><div key={name} className="rounded-xl border p-4"><p className="text-sm opacity-60">{name}</p><p className="text-2xl font-bold">{n}</p></div>)}</section>
    <section className="rounded-2xl border p-5 space-y-4"><h2 className="text-xl font-semibold">YouTube Music Link Manager</h2><p className="text-sm opacity-70">Klistra in korrekt YouTube Music-länk. Ändringar sparas som skyddade förslag och publiceras via GitHub Actions.</p><div className="flex flex-wrap gap-3"><input aria-label="Sök låt" className="min-w-48 flex-1 rounded-lg border bg-transparent p-3" placeholder="Sök låt eller Spotify-ID" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Artist" className="rounded-lg border bg-transparent p-3" value={artist} onChange={e=>setArtist(e.target.value)}><option value="all">Alla artister</option><option value="artist-frostmark">Frostmark</option><option value="artist-wolfyslayer">Wolfyslayer</option></select><label className="flex items-center gap-2"><input type="checkbox" checked={missing} onChange={e=>setMissing(e.target.checked)}/>Bara saknade</label></div>
    <div className="max-h-[65vh] space-y-3 overflow-auto">{filtered.map(t=><div key={t.id} className="rounded-xl border p-4 space-y-2"><div className="flex flex-wrap justify-between gap-2"><div><h3 className="font-semibold">{t.title}</h3><p className="text-xs opacity-60">{t.artistId === "artist-frostmark" ? "Frostmark" : "Wolfyslayer"} · {t.durationSeconds ?? "?"} sek</p></div><span className="text-xs opacity-70">{pending.some(p=>p.track_id===t.id) ? "Väntar på publicering" : t.youtubeMusicTrackUrl ? "Länkad" : "Saknar länk"}</span></div><div className="flex flex-wrap gap-2"><input aria-label={`YouTube-länk för ${t.title}`} className="min-w-48 flex-1 rounded-lg border bg-transparent p-2" placeholder="https://music.youtube.com/watch?v=..." value={editing[t.id] ?? pending.find(p=>p.track_id===t.id)?.youtube_url ?? t.youtubeMusicTrackUrl ?? ""} onChange={e=>setEditing(s=>({...s,[t.id]:e.target.value}))}/><button disabled={busy} className="rounded-lg border px-4 py-2 disabled:opacity-50" onClick={()=>void save(t)}>Spara förslag</button></div></div>)}</div></section></>}
    {message && <p role="status" className="rounded-lg border p-3">{message}</p>}
  </main>;
}
