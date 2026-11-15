import type { AuthRepository, ResultadoGoogle } from "@/core/domain/ports";
import type { Sesion } from "@/core/domain/entities/sesion";
import type { Credenciales, DatosGoogle, DatosRegistro, PerfilGoogle } from "@/core/domain/entities/usuario";
import { AppError } from "@/core/domain/errors";
import { internalApi } from "../http/internal-client";

/** Habla con los Route Handlers /api/auth/* (que a su vez gestionan la cookie). */
export class HttpAuthRepository implements AuthRepository {
  async iniciarSesion(credenciales: Credenciales): Promise<Sesion> {
    const { data } = await internalApi.post<{ sesion: Sesion }>("/auth/login", credenciales);
    return data.sesion;
  }

  async registrarse(datos: DatosRegistro): Promise<Sesion> {
    const { data } = await internalApi.post<{ sesion: Sesion }>("/auth/register", datos);
    return data.sesion;
  }

  /** 428 con `perfil` = el correo de Google aún no tiene cuenta y faltan datos (documento y términos). */
  async accederConGoogle(datos: DatosGoogle): Promise<ResultadoGoogle> {
    try {
      const { data } = await internalApi.post<{ sesion: Sesion }>("/auth/google", datos);
      return { tipo: "sesion", sesion: data.sesion };
    } catch (e) {
      const perfil = (e as AppError).detalle as { perfil?: PerfilGoogle } | undefined;
      if (e instanceof AppError && e.status === 428 && perfil?.perfil) {
        return { tipo: "incompleto", perfil: perfil.perfil };
      }
      throw e;
    }
  }

  async cerrarSesion(): Promise<void> {
    await internalApi.post("/auth/logout");
  }

  async obtenerSesion(): Promise<Sesion | null> {
    try {
      const { data } = await internalApi.get<{ sesion: Sesion }>("/auth/session");
      return data.sesion;
    } catch (e) {
      if (e instanceof AppError && e.noAutorizado) return null;
      throw e;
    }
  }
}
