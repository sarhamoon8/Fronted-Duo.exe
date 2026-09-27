/** Espejo exacto del enum `Rol` del backend (prisma/schema.prisma). */
export const ROLES = ["PACIENTE", "FUNCIONARIO", "ADMIN"] as const;
export type Rol = (typeof ROLES)[number];

export const ROL_ETIQUETA: Record<Rol, string> = {
  PACIENTE: "Paciente",
  FUNCIONARIO: "Funcionario",
  ADMIN: "Administrador",
};

export const ROLES_STAFF: readonly Rol[] = ["FUNCIONARIO", "ADMIN"];

export function esStaff(rol: Rol): boolean {
  return ROLES_STAFF.includes(rol);
}
