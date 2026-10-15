"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { localeCookieName, locales, type Locale } from "./types";

export async function setLocale(locale: Locale) {
  if (!locales.includes(locale)) return;
  const cookieStore = await cookies();
  cookieStore.set(localeCookieName, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/", "layout");
}
