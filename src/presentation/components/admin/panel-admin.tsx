"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import type { EntidadMedica, Servicio } from "@/core/domain/entities/catalogo";
import { ROLES, ROL_ETIQUETA, type Rol } from "@/core/domain/entities/rol";
import type { Usuario } from "@/core/domain/entities/usuario";
import { AppError, mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { formatearFechaHora } from "@/presentation/lib/cn";
import { Alert, ListaErrores } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

function useMutacion() {
  const [enviando, setEnviando] = useState(false);
  const [errores, setErrores] = useState<string[]>([]);
  const [exito, setExito] = useState<string | null>(null);
  async function correr(fn: () => Promise<string>) {
    setEnviando(true);
    setErrores([]);
    setExito(null);
    try {
      setExito(await fn());
      return true;
    } catch (e) {
      setErrores(e instanceof AppError ? e.mensajes : [mensajeDeError(e)]);
      return false;
    } finally {
      setEnviando(false);
    }
  }
  return { enviando, errores, exito, correr };
}

function Mensajes({ errores, exito }: { errores: string[]; exito: string | null }) {
  return (
    <div aria-live="polite" className="flex flex-col gap-3">
      {exito && <Alert tono="exito" titulo={exito} />}
      <ListaErrores errores={errores} />
    </div>
  );
}

function cargarTodo() {
  return Promise.all([
    casosDeUso.listarEntidades.ejecutar(),
    casosDeUso.listarServicios.ejecutar(),
    casosDeUso.listarUsuarios.ejecutar(),
  ]);
}

export function PanelAdmin() {
  const [entidades, setEntidades] = useState<EntidadMedica[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorCarga, setErrorCarga] = useState<string | null>(null);

  const aplicar = useCallback((r: [EntidadMedica[], Servicio[], Usuario[]]) => {
    setEntidades(r[0]);
    setServicios(r[1]);
    setUsuarios(r[2]);
    setErrorCarga(null);
    setCargando(false);
  }, []);
  const fallar = useCallback((err: unknown) => {
    setErrorCarga(mensajeDeError(err));
    setCargando(false);
  }, []);

  const recargar = useCallback(() => cargarTodo().then(aplicar, fallar), [aplicar, fallar]);

  useEffect(() => {
    cargarTodo().then(aplicar, fallar);
  }, [aplicar, fallar]);

  /* ---- Entidad ---- */
  const [nombreEntidad, setNombreEntidad] = useState("");
  const mEntidad = useMutacion();
  async function crearEntidad(e: FormEvent) {
    e.preventDefault();
    const ok = await mEntidad.correr(async () => {
      const r = await casosDeUso.crearEntidad.ejecutar(nombreEntidad);
      return `Entidad "${r.nombre}" registrada.`;
    });
    if (ok) {
      setNombreEntidad("");
      void recargar();
    }
  }

  /* ---- Servicio ---- */
  const [servicio, setServicio] = useState({ nombre: "", entidadId: "" });
  const mServicio = useMutacion();
  async function crearServicio(e: FormEvent) {
    e.preventDefault();
    const ok = await mServicio.correr(async () => {
      const r = await casosDeUso.crearServicio.ejecutar(servicio.nombre, servicio.entidadId);
      return `Servicio "${r.nombre}" registrado.`;
    });
    if (ok) {
      setServicio((s) => ({ ...s, nombre: "" }));
      void recargar();
    }
  }

  /* ---- Usuario ---- */
  const vacioUsuario = {
    numeroDocumento: "",
    tipoDocumento: "CC",
    nombres: "",
    apellidos: "",
    email: "",
    password: "",
    rol: "FUNCIONARIO" as Rol,
  };
  const [usuario, setUsuario] = useState(vacioUsuario);
  const mUsuario = useMutacion();
  async function crearUsuario(e: FormEvent) {
    e.preventDefault();
    const ok = await mUsuario.correr(async () => {
      const r = await casosDeUso.crearUsuario.ejecutar(usuario);
      return `${ROL_ETIQUETA[r.rol]} "${r.nombres} ${r.apellidos}" creado.`;
    });
    if (ok) {
      setUsuario(vacioUsuario);
      void recargar();
    }
  }

  const nombreEntidadPorId = Object.fromEntries(entidades.map((e) => [e.id, e.nombre]));

  return (
    <div className="flex flex-col gap-6">
      {errorCarga && <Alert tono="error" titulo="No se pudo cargar la información">{errorCarga}</Alert>}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card aria-labelledby="t-entidad">
          <CardTitulo id="t-entidad">Nueva entidad médica</CardTitulo>
          <form onSubmit={crearEntidad} noValidate className="flex flex-col gap-4">
            <Mensajes errores={mEntidad.errores} exito={mEntidad.exito} />
            <Input etiqueta="Nombre" value={nombreEntidad} onChange={(e) => setNombreEntidad(e.target.value)} placeholder="Ej.: EPS Sanitas – Fusagasugá" required />
            <Button type="submit" cargando={mEntidad.enviando}>Registrar entidad</Button>
          </form>
        </Card>

        <Card aria-labelledby="t-servicio">
          <CardTitulo id="t-servicio">Nuevo servicio</CardTitulo>
          <form onSubmit={crearServicio} noValidate className="flex flex-col gap-4">
            <Mensajes errores={mServicio.errores} exito={mServicio.exito} />
            <Select etiqueta="Entidad médica" value={servicio.entidadId} onChange={(e) => setServicio((s) => ({ ...s, entidadId: e.target.value }))} required>
              <option value="">Selecciona una entidad</option>
              {entidades.map((e) => (
                <option key={e.id} value={e.id}>{e.nombre}</option>
              ))}
            </Select>
            <Input etiqueta="Nombre del servicio" value={servicio.nombre} onChange={(e) => setServicio((s) => ({ ...s, nombre: e.target.value }))} placeholder="Ej.: Dispensación de medicamentos" required />
            <Button type="submit" cargando={mServicio.enviando}>Registrar servicio</Button>
          </form>
        </Card>

        <Card aria-labelledby="t-usuario">
          <CardTitulo id="t-usuario">Nuevo usuario</CardTitulo>
          <form onSubmit={crearUsuario} noValidate className="flex flex-col gap-4">
            <Mensajes errores={mUsuario.errores} exito={mUsuario.exito} />
            <div className="grid grid-cols-2 gap-3">
              <Select etiqueta="Tipo doc." value={usuario.tipoDocumento} onChange={(e) => setUsuario((u) => ({ ...u, tipoDocumento: e.target.value }))}>
                <option value="CC">CC</option>
                <option value="TI">TI</option>
                <option value="CE">CE</option>
                <option value="PA">PA</option>
              </Select>
              <Input etiqueta="N.º documento" value={usuario.numeroDocumento} onChange={(e) => setUsuario((u) => ({ ...u, numeroDocumento: e.target.value }))} autoComplete="off" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input etiqueta="Nombres" value={usuario.nombres} onChange={(e) => setUsuario((u) => ({ ...u, nombres: e.target.value }))} autoComplete="off" required />
              <Input etiqueta="Apellidos" value={usuario.apellidos} onChange={(e) => setUsuario((u) => ({ ...u, apellidos: e.target.value }))} autoComplete="off" required />
            </div>
            <Input etiqueta="Correo" type="email" value={usuario.email} onChange={(e) => setUsuario((u) => ({ ...u, email: e.target.value }))} autoComplete="off" required />
            <Input etiqueta="Contraseña inicial" type="password" value={usuario.password} onChange={(e) => setUsuario((u) => ({ ...u, password: e.target.value }))} autoComplete="new-password" ayuda="Mínimo 6 caracteres." required />
            <Select etiqueta="Rol" value={usuario.rol} onChange={(e) => setUsuario((u) => ({ ...u, rol: e.target.value as Rol }))}>
              {ROLES.map((r) => (
                <option key={r} value={r}>{ROL_ETIQUETA[r]}</option>
              ))}
            </Select>
            <Button type="submit" cargando={mUsuario.enviando}>Crear usuario</Button>
          </form>
        </Card>
      </div>

      {cargando ? (
        <Spinner etiqueta="Cargando registros…" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card aria-labelledby="t-catalogo">
            <CardTitulo id="t-catalogo">Servicios por entidad</CardTitulo>
            {entidades.length === 0 ? (
              <EstadoVacio titulo="Sin entidades registradas" />
            ) : (
              <ul className="flex flex-col gap-3">
                {entidades.map((e) => {
                  const propios = servicios.filter((s) => s.entidadId === e.id);
                  return (
                    <li key={e.id} className="rounded-xl bg-neutro-2 p-4 ring-1 ring-borde">
                      <p className="font-semibold">{e.nombre}</p>
                      {propios.length ? (
                        <ul className="mt-1 list-disc pl-5 text-sm text-tinta-suave">
                          {propios.map((s) => <li key={s.id}>{s.nombre}</li>)}
                        </ul>
                      ) : (
                        <p className="text-sm text-tinta-suave">Sin servicios.</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {servicios.some((s) => !nombreEntidadPorId[s.entidadId]) && (
              <p className="mt-3 text-sm text-tinta-suave">Hay servicios asociados a entidades no listadas.</p>
            )}
          </Card>

          <Card aria-labelledby="t-usuarios">
            <CardTitulo id="t-usuarios">Usuarios ({usuarios.length})</CardTitulo>
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <caption className="sr-only">Usuarios registrados</caption>
                <thead className="bg-neutro text-[11px] uppercase tracking-wider text-tinta-tenue">
                  <tr>
                    <th scope="col" className="px-3 py-2">Nombre</th>
                    <th scope="col" className="px-3 py-2">Correo</th>
                    <th scope="col" className="px-3 py-2">Rol</th>
                    <th scope="col" className="px-3 py-2">Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borde">
                  {usuarios.map((u, i) => (
                    <tr key={u.id} className={i % 2 ? "bg-neutro-2" : "bg-superficie"}>
                      <td className="px-3 py-2 font-medium">{u.nombres} {u.apellidos}</td>
                      <td className="px-3 py-2">{u.email}</td>
                      <td className="px-3 py-2">{ROL_ETIQUETA[u.rol]}</td>
                      <td className="px-3 py-2 whitespace-nowrap">{formatearFechaHora(u.creadoEn)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
