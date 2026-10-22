"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CheckCircle2, Clock3, Disc3, ExternalLink, Link2, LogOut, Music2, RefreshCw, Search, ShieldCheck, Youtube } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Track } from "@/lib/types/content";

type Pending = { track_id: string; youtube_url: string; updated_at: string };
const client = createClient();

const validLink = (raw: string) => {
  try {
    const u = new URL(raw.trim());
    return u.protocol === "https:" && u.hostname === "music.youtube.com" && u.pathname === "/watch" &&
      /^[A-Za-z0-9_-]{11}$/.test(u.searchParams.get("v") ?? "") && [...u.searchParams.keys()].every(k => k === "v");
  } catch { return false; }
};
export default function ControlRoom({ tracks }: { tracks: Track[] }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<"overview" | "links" | "queue" | "tools">("overview");
  const [onlyPending, setOnlyPending] = useState(false);
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
    const linked = tracks.filter(t => !!t.youtubeMusicTrackUrl).length;
  const missingCount = tracks.length - linked;
  const completion = tracks.length ? Math.round(linked / tracks.length * 100) : 0;
  const nav = [
    { id: "overview", label: "Översikt", icon: Disc3 },
    { id: "links", label: "Länkhantering", icon: Link2 },
    { id: "queue", label: "Att granska", icon: Clock3 },
    { id: "tools", label: "Verktyg", icon: RefreshCw },
  ] as const;
  const field = "min-h-11 w-full rounded-sm border border-border bg-void/70 px-4 py-2.5 text-text-primary placeholder:text-text-muted/60 focus-visible:outline-silver";
  const action = "inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-silver/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-silver transition-colors hover:bg-silver/10 disabled:cursor-not-allowed disabled:opacity-40";
  const card = "border border-border-subtle bg-surface/80 p-5 sm:p-6";
  if (!client) return <main className="mx-auto max-w-lg p-10"><h1 className="font-display text-2xl">Control Room</h1><p>Supabase är inte konfigurerat.</p></main>;
  if (checking) return <main className="flex min-h-screen items-center justify-center text-text-muted" role="status">Verifierar säker session…</main>;
  return (
    <main className="min-h-screen bg-void text-text-primary">
    <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-frost/20 to-transparent" aria-hidden="true" />
    <div className="relative mx-auto max-w-[90rem] px-4 pb-20 pt-8 sm:px-8 lg:px-12">
      <header className="mb-9 flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div><p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.35em] text-wolf-glow">Wolfyslayer Records / Private</p><h1 className="font-display text-3xl tracking-wide text-silver sm:text-4xl">CONTROL ROOM</h1><p className="mt-2 text-sm text-text-muted">Musikkatalog · YouTube Music · Administration</p></div>
        <div className="flex items-center gap-2"><span className="inline-flex items-center gap-2 border border-success/30 bg-success/5 px-3 py-2 text-xs text-success"><ShieldCheck size={15}/> Säker anslutning</span>{userId && <button className={action} onClick={() => void client.auth.signOut()}><LogOut size={15}/> Logga ut</button>}</div>
      </header>
      {!userId ? <section className="mx-auto mt-16 max-w-md border border-border bg-surface p-7 sm:p-10"><ShieldCheck className="mb-5 text-wolf-glow" size={32}/><h2 className="font-display text-2xl text-silver">ADMIN LOGIN</h2><p className="mb-7 mt-2 text-sm text-text-muted">Endast behöriga administratörer.</p><form onSubmit={e => void signIn(e)} className="space-y-4"><label className="block space-y-2 text-xs uppercase tracking-widest text-text-muted">E-post<input className={field} type="email" required autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)}/></label><label className="block space-y-2 text-xs uppercase tracking-widest text-text-muted">Lösenord<input className={field} type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className={action+" w-full"}>Logga in <ArrowUpRight size={16}/></button></form></section> :
      !authorized ? <section className={card}><h2 className="font-display text-xl">Åtkomst nekad</h2><p className="mt-2 text-text-muted">Ditt konto saknar administratörsbehörighet.</p></section> :
      <div className="grid gap-7 lg:grid-cols-[230px_minmax(0,1fr)]">
        <nav aria-label="Administration" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:pb-0">{nav.map(item => <button key={item.id} onClick={()=>{setTab(item.id);setOnlyPending(item.id==="queue");if(item.id==="queue")setMissing(false);}} aria-current={tab===item.id?"page":undefined} className={"flex min-h-12 shrink-0 items-center gap-3 border px-4 text-left text-xs font-semibold uppercase tracking-wider transition-colors "+(tab===item.id?"border-wolf-glow/60 bg-wolf/15 text-silver":"border-transparent text-text-muted hover:border-border hover:text-silver")}><item.icon size={17}/>{item.label}</button>)}</nav>
        <div className="min-w-0 space-y-6">
          {(tab==="overview" || tab==="links" || tab==="queue") && <>
            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {([{label:"Totalt antal låtar",value:tracks.length,icon:Music2},{label:"YouTube-länkade",value:linked,icon:CheckCircle2},{label:"Saknade länkar",value:missingCount,icon:Youtube},{label:"Väntar på granskning",value:pending.length,icon:Clock3}]).map(item=><div key={item.label} className={card}><item.icon className="mb-4 text-wolf-glow" size={20}/><p className="font-display text-3xl text-silver">{item.value}</p><p className="mt-1 text-xs text-text-muted">{item.label}</p></div>)}
            </div>
            {tab==="overview" && <section className={card}><div className="mb-4 flex items-center justify-between gap-3"><h2 className="font-display text-xl text-silver">Katalogens täckning</h2><span className="text-2xl font-semibold text-wolf-glow">{completion}%</span></div><div className="h-2 overflow-hidden bg-charcoal" role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label="YouTube Music-täckning"><div className="h-full bg-wolf-glow" style={{width:completion+"%"}} /></div><p className="mt-3 text-sm text-text-muted">{missingCount} låtar saknar direktlänk. Koppla dem manuellt eller granska importerade förslag.</p><button className={action+" mt-5"} onClick={()=>{setTab("links");setMissing(true);setOnlyPending(false)}}>Hantera saknade länkar <ArrowUpRight size={15}/></button></section>}
            {(tab==="links" || tab==="queue") && <section className={card+" space-y-5"}><div><p className="text-[10px] uppercase tracking-[0.3em] text-wolf-glow">Catalog editor</p><h2 className="mt-2 font-display text-2xl text-silver">{tab==="queue"?"Förslag som väntar":"YouTube Music Link Manager"}</h2><p className="mt-2 text-sm text-text-muted">Spara en verifierad direktlänk. Ändringen skickas till granskning innan publicering.</p></div><div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"><label className="relative"><Search size={17} className="absolute left-3 top-3.5 text-text-muted"/><input aria-label="Sök låt" className={field+" pl-10"} placeholder="Sök titel eller Spotify-ID" value={query} onChange={e=>setQuery(e.target.value)}/></label><select aria-label="Filtrera artist" className={field} value={artist} onChange={e=>setArtist(e.target.value)}><option value="all">Alla artister</option><option value="artist-frostmark">Frostmark</option><option value="artist-wolfyslayer">Wolfyslayer</option></select></div><label className="flex items-center gap-3 text-sm text-text-muted"><input type="checkbox" checked={missing} onChange={e=>setMissing(e.target.checked)}/>Visa bara låtar utan publicerad länk</label><p className="text-xs text-text-muted" role="status">{filtered.length} låtar visas</p>
            <div className="max-h-[70vh] space-y-3 overflow-auto">
              {filtered.map((track) => {
                const proposal = pending.find((p) => p.track_id === track.id);
                return (
                  <article key={track.id} className="border border-border bg-void/60 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div><h3 className="font-semibold text-silver">{track.title}</h3><p className="mt-1 text-xs text-text-muted">{track.artistId === "artist-frostmark" ? "Frostmark" : "Wolfyslayer"}</p></div>
                      <span className="border border-border px-2 py-1 text-xs">{proposal ? "Väntar" : track.youtubeMusicTrackUrl ? "Länkad" : "Saknas"}</span>
                    </div>
                    <div className="mb-3 flex gap-3 text-xs">
                      {track.spotifyTrackUrl ? <a href={track.spotifyTrackUrl} target="_blank" rel="noopener noreferrer">Spotify ↗</a> : null}
                      {track.youtubeMusicTrackUrl ? <a href={track.youtubeMusicTrackUrl} target="_blank" rel="noopener noreferrer">YouTube ↗</a> : null}
                      {proposal ? <a href={proposal.youtube_url} target="_blank" rel="noopener noreferrer">Granska förslag ↗</a> : null}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input aria-label={"YouTube-länk för " + track.title} className={field + " min-w-0 flex-1"} placeholder="https://music.youtube.com/watch?v=..." value={editing[track.id] ?? proposal?.youtube_url ?? track.youtubeMusicTrackUrl ?? ""} onChange={(e) => setEditing((s) => ({ ...s, [track.id]: e.target.value }))} />
                      <button disabled={busy} className={action} onClick={() => void save(track)}>Spara förslag</button>
                    </div>
                  </article>
                );
              })}
              {filtered.length === 0 ? <p className="py-10 text-center text-text-muted">Inga låtar matchar filtreringen.</p> : null}
            </div></section>}
          </>}
          {tab==="tools" && <section className={card+" space-y-6"}><div><p className="text-[10px] uppercase tracking-[0.3em] text-wolf-glow">Operations</p><h2 className="mt-2 font-display text-2xl text-silver">Import & publicering</h2><p className="mt-2 text-sm text-text-muted">Öppna säkra GitHub-flöden för importer, förslagsgranskning och publicering. Ingen åtgärd körs automatiskt här.</p></div><div className="grid gap-3 sm:grid-cols-2">{[{title:"Spotify & YouTube-import",desc:"Kontrollera den schemalagda katalogimporten.",url:"https://github.com/Wolfyslayer/Label-website/actions/workflows/import-spotify.yml"},{title:"Publicera länkförslag",desc:"Skapa PR av sparade YouTube Music-länkar.",url:"https://github.com/Wolfyslayer/Label-website/actions/workflows/apply-admin-youtube-links.yml"},{title:"Granska ändringar",desc:"Öppna pull requests före publicering.",url:"https://github.com/Wolfyslayer/Label-website/pulls"},{title:"Drift & deploy",desc:"Kontrollera senaste GitHub Pages-deploy.",url:"https://github.com/Wolfyslayer/Label-website/actions/workflows/deploy-github-pages.yml"}].map(item=><a key={item.title} href={item.url} target="_blank" rel="noopener noreferrer" className="group border border-border p-5 transition-colors hover:border-wolf-glow"><ArrowUpRight className="mb-3 text-wolf-glow" size={19}/><h3 className="font-semibold text-silver">{item.title}</h3><p className="mt-2 text-sm text-text-muted">{item.desc}</p></a>)}</div></section>}
        </div>
      </div>}
      {message && <p role="status" className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl border border-wolf/60 bg-charcoal p-4 text-sm shadow-xl">{message}<button className="ml-3 underline" onClick={()=>setMessage("")}>Stäng</button></p>}
    </div>
    </main>
  );
}
