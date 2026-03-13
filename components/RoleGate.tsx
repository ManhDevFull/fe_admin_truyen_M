"use client";

import { ReactNode } from "react";
import { useAdminAuth } from "../lib/store";
import { can } from "../lib/permissions";

type RoleGateProps = {
  permission: string;
  children: ReactNode;
};

export default function RoleGate({ permission, children }: RoleGateProps) {
  const user = useAdminAuth((s) => s.user);
  const permissions = useAdminAuth((s) => s.permissions);
  if (!can(user?.role, permissions, permission)) return null;
  return <>{children}</>;
}
