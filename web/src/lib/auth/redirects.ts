export const DEFAULT_AUTH_REDIRECT = "/start";

export function getSafeNextPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return DEFAULT_AUTH_REDIRECT;
  }

  return value;
}

export function getStringParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
