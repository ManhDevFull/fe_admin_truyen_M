export function can(role: string | null | undefined, permissions: string[], required: string): boolean {
  if (!role) return false;
  if (role === "owner") return true;
  if (permissions.includes("*")) return true;
  return permissions.includes(required);
}
