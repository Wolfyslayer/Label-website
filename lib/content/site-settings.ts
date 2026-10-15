import { siteConfig } from "@/lib/config/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type PublicSocialLinks = typeof siteConfig.social;

export async function getPublicSocialLinks(): Promise<PublicSocialLinks> {
  if (!isSupabaseConfigured()) return siteConfig.social;

  const supabase = await createClient();
  if (!supabase) return siteConfig.social;

  const { data } = await supabase.from("site_settings").select("social_links").eq("id", 1).maybeSingle();
  const fromDb = (data?.social_links as Partial<PublicSocialLinks>) ?? {};

  return {
    instagram: fromDb.instagram || siteConfig.social.instagram,
    youtube: fromDb.youtube || siteConfig.social.youtube,
    spotify: fromDb.spotify || siteConfig.social.spotify,
    facebook: fromDb.facebook || siteConfig.social.facebook,
    x: fromDb.x || siteConfig.social.x,
  };
}
