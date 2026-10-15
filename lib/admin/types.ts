export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type LocalizedFormValue = {
  en: string;
  sv: string;
};
