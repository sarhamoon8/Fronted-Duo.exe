/**
 * Requisitos de la contraseña al crear una cuenta. Son los mismos que valida
 * RegisterDto en el backend (8+ caracteres, mayúscula, minúscula, número y un
 * símbolo entre !, @ y #); la pantalla "Crear cuenta" los muestra como lista.
 */
export interface ReglaPassword {
  id: string;
  /** Texto de la lista de requisitos ("Debe contener al menos:"). */
  texto: string;
  /** Fragmento para armar el mensaje de error ("La contraseña debe tener …"). */
  falta: string;
  cumple: (password: string) => boolean;
}

export const PASSWORD_MIN_LONGITUD = 8;

export const REGLAS_PASSWORD: readonly ReglaPassword[] = [
  {
    id: "longitud",
    texto: `${PASSWORD_MIN_LONGITUD} caracteres`,
    falta: `al menos ${PASSWORD_MIN_LONGITUD} caracteres`,
    cumple: (p) => p.length >= PASSWORD_MIN_LONGITUD,
  },
  { id: "mayuscula", texto: "Una letra mayúscula", falta: "una letra mayúscula", cumple: (p) => /[A-Z]/.test(p) },
  { id: "minuscula", texto: "Una letra minúscula", falta: "una letra minúscula", cumple: (p) => /[a-z]/.test(p) },
  { id: "numero", texto: "Un número", falta: "un número", cumple: (p) => /\d/.test(p) },
  {
    id: "simbolo",
    texto: "Un símbolo especial: !, @ o #",
    falta: "un símbolo especial (!, @ o #)",
    cumple: (p) => /[!@#]/.test(p),
  },
];

/** Reglas que la contraseña todavía no cumple (vacío = es válida). */
export function reglasIncumplidas(password: string): ReglaPassword[] {
  return REGLAS_PASSWORD.filter((r) => !r.cumple(password));
}
