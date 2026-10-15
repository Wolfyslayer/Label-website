import { createClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function isUserAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function requireAdmin() {
  const user = await getSessionUser();
  if (!user) return { user: null, isAdmin: false as const };
  const isAdmin = await isUserAdmin(user.id);
  return { user, isAdmin: isAdmin as boolean };
}
