import type { UsuarioRepository } from "@/core/domain/ports";
import type { NuevoUsuario, Usuario } from "@/core/domain/entities/usuario";
import { internalApi } from "../http/internal-client";
import { UsuarioMapper, type UsuarioDto } from "../mappers";

/** GET/POST /usuarios (solo ADMIN). */
export class HttpUsuarioRepository implements UsuarioRepository {
  async listar(): Promise<Usuario[]> {
    const { data } = await internalApi.get<UsuarioDto[]>("/bff/usuarios");
    return data.map(UsuarioMapper.toDomain);
  }

  async crear(datos: NuevoUsuario): Promise<Usuario> {
    const { data } = await internalApi.post<UsuarioDto>("/bff/usuarios", datos);
    return UsuarioMapper.toDomain(data);
  }
}
