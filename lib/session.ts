export function setAdminSessionCookie(maxAgeSeconds = 60 * 60 * 24 * 30) {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = `admin_session=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax${
    secure ? "; Secure" : ""
  }`;
}

export function clearAdminSessionCookie() {
  if (typeof document === "undefined") return;
  const secure = typeof location !== "undefined" && location.protocol === "https:";
  document.cookie = `admin_session=; Path=/; Max-Age=0; SameSite=Lax${secure ? "; Secure" : ""}`;
}
