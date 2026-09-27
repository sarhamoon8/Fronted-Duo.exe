/**
 * Error normalizado de la aplicación. Los repositorios traducen cualquier
 * fallo HTTP (formato de NestJS: { message: string | string[], error, statusCode })
 * a esta clase para que la presentación no dependa de Axios.
 */
export class AppError extends Error {
  constructor(
    public readonly mensajes: string[],
    public readonly status: number,
    public readonly origen: "interna" | "red" = "interna",
  ) {
    super(mensajes.join(". "));
    this.name = "AppError";
  }

  get noAutorizado(): boolean {
    return this.status === 401;
  }

  get prohibido(): boolean {
    return this.status === 403;
  }
}

export function mensajeDeError(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  return "Ocurrió un error inesperado.";
}
