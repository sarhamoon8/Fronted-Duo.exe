"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Plus, Search, UserPlus, Users } from "lucide-react";
import type { Rol } from "@/core/domain/entities/rol";
import { mensajeDeError } from "@/core/domain/errors";
import { casosDeUso } from "@/infrastructure/container";
import { useRecurso } from "@/presentation/hooks/use-recurso";
import { PERFIL_ETIQUETA } from "@/presentation/components/layout/navegacion";
import { iniciales } from "@/presentation/components/layout/pagina";
import { Alert } from "@/presentation/components/ui/alert";
import { Button } from "@/presentation/components/ui/button";
import { Card, CardTitulo, EncabezadoPagina, Indicador, Pildora } from "@/presentation/components/ui/card";
import { EstadoVacio } from "@/presentation/components/ui/empty-state";
import { Input, Select } from "@/presentation/components/ui/field";
import { Spinner } from "@/presentation/components/ui/spinner";

const NUEVO = {
  tipoDocumento: "CC",
  numeroDocumento: "",
  nombres: "",
  apellidos: "",
  email: "",
  telefono: "",
  password: "",
  rol: "FUNCIONARIO" as Rol,
};

/** Personal de atención y administradores: listado con búsqueda y alta de cuentas. */
export function PersonalAdmin() {
  const [busqueda, setBusqueda] = useState("");
  const [filtroRol, setFiltroRol] = useState<"" | Rol>("");
  const [formulario, setFormulario] = useState(NUEVO);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tono: "exito" | "error"; texto: string } | null>(null);

  const { datos, cargando, error, recargar } = useRecurso("personal", () => casosDeUso.listarUsuarios.ejecutar());

  const personal = useMemo(() => (datos ?? []).filter((u) => u.rol !== "PACIENTE"), [datos]);
  const visibles = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    return personal.filter(
      (u) =>
        (!filtroRol || u.rol === filtroRol) &&
        (!termino || `${u.nombres} ${u.apellidos} ${u.email} ${u.numeroDocumento}`.toLowerCase().includes(termino)),
    );
  }, [personal, busqueda, filtroRol]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    setMensaje(null);
    setGuardando(true);
    try {
      const creado = await casosDeUso.crearUsuario.ejecutar({
        ...formulario,
        telefono: formulario.telefono.trim() || undefined,
      });
      setMensaje({ tono: "exito", texto: `Cuenta de ${creado.nombres} ${creado.apellidos} creada.` });
      setFormulario(NUEVO);
      setMostrarFormulario(false);
      recargar();
    } catch (err) {
      setMensaje({ tono: "error", texto: mensajeDeError(err) });
    } finally {
      setGuardando(false);
    }
  }

  const campo = <K extends keyof typeof NUEVO>(k: K, valor: (typeof NUEVO)[K]) => setFormulario((f) => ({ ...f, [k]: valor }));

  return (
    <>
      <EncabezadoPagina
        titulo="Gestión de personal"
        descripcion="Administra las cuentas del personal de atención y de los administradores."
        acciones={
          <Button onClick={() => setMostrarFormulario((v) => !v)} icono={<UserPlus className="size-4" aria-hidden="true" />}>
            {mostrarFormulario ? "Cerrar formulario" : "Crear cuenta"}
          </Button>
        }
      />

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Indicador etiqueta="Cuentas" valor={personal.length} icono={<Users className="size-4" aria-hidden="true" />} />
        <Indicador etiqueta="Personal" valor={personal.filter((u) => u.rol === "FUNCIONARIO").length} icono={<Users className="size-4" aria-hidden="true" />} tono="menta" />
        <Indicador etiqueta="Admins" valor={personal.filter((u) => u.rol === "ADMIN").length} icono={<Users className="size-4" aria-hidden="true" />} tono="azul" />
      </div>

      {mensaje && (
        <div className="mb-4">
          <Alert tono={mensaje.tono}>{mensaje.texto}</Alert>
        </div>
      )}

      {mostrarFormulario && (
        <Card aria-labelledby="t-crear-cuenta" className="mb-5">
          <CardTitulo id="t-crear-cuenta" descripcion="Los campos son obligatorios, salvo el teléfono.">
            Crear cuenta del personal
          </CardTitulo>
          <form onSubmit={crear} className="grid gap-4 md:grid-cols-2">
            <Input etiqueta="Nombres" value={formulario.nombres} onChange={(e) => campo("nombres", e.target.value)} autoComplete="off" required />
            <Input etiqueta="Apellidos" value={formulario.apellidos} onChange={(e) => campo("apellidos", e.target.value)} autoComplete="off" required />
            <Select etiqueta="Tipo de documento" value={formulario.tipoDocumento} onChange={(e) => campo("tipoDocumento", e.target.value)}>
              <option value="CC">Cédula de ciudadanía</option>
              <option value="CE">Cédula de extranjería</option>
              <option value="TI">Tarjeta de identidad</option>
              <option value="PA">Pasaporte</option>
            </Select>
            <Input etiqueta="Número de documento" value={formulario.numeroDocumento} onChange={(e) => campo("numeroDocumento", e.target.value)} autoComplete="off" required />
            <Input etiqueta="Correo electrónico" type="email" value={formulario.email} onChange={(e) => campo("email", e.target.value)} autoComplete="off" required />
            <Input etiqueta="Teléfono (opcional)" type="tel" value={formulario.telefono} onChange={(e) => campo("telefono", e.target.value)} />
            <Input
              etiqueta="Contraseña inicial"
              type="password"
              value={formulario.password}
              onChange={(e) => campo("password", e.target.value)}
              autoComplete="new-password"
              ayuda="Mínimo 6 caracteres. La persona podrá cambiarla después."
              required
            />
            <Select etiqueta="Rol" value={formulario.rol} onChange={(e) => campo("rol", e.target.value as Rol)}>
              <option value="FUNCIONARIO">Personal de atención</option>
              <option value="ADMIN">Administrador</option>
            </Select>
            <div className="md:col-span-2">
              <Button type="submit" cargando={guardando} icono={<Plus className="size-4" aria-hidden="true" />}>
                Crear cuenta
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card aria-labelledby="t-lista-personal">
        <CardTitulo id="t-lista-personal" descripcion={`${visibles.length} ${visibles.length === 1 ? "persona" : "personas"}`}>
          Personal registrado
        </CardTitulo>
        <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_14rem]">
          <Input
            etiqueta="Buscar por nombre, correo o documento"
            type="search"
            placeholder="Escribe para buscar"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            autoComplete="off"
          />
          <Select etiqueta="Rol" value={filtroRol} onChange={(e) => setFiltroRol(e.target.value as "" | Rol)}>
            <option value="">Todos los roles</option>
            <option value="FUNCIONARIO">Personal de atención</option>
            <option value="ADMIN">Administrador</option>
          </Select>
        </div>

        {cargando && !datos ? (
          <div className="flex justify-center py-10">
            <Spinner className="size-6" />
          </div>
        ) : error && !datos ? (
          <Alert tono="error">{error}</Alert>
        ) : visibles.length === 0 ? (
          <EstadoVacio titulo="No hay personas que coincidan" icono={<Search className="size-5" />}>
            Cambia la búsqueda o crea una cuenta nueva.
          </EstadoVacio>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <caption className="sr-only">Personal registrado</caption>
              <thead className="text-[11px] text-tinta-tenue">
                <tr className="bg-neutro">
                  <th scope="col" className="h-10 rounded-l-lg px-3.5 font-normal">NOMBRE</th>
                  <th scope="col" className="px-3.5 font-normal">DOCUMENTO</th>
                  <th scope="col" className="px-3.5 font-normal">CONTACTO</th>
                  <th scope="col" className="rounded-r-lg px-3.5 font-normal">ROL</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((u) => (
                  <tr key={u.id} className="border-b border-borde text-tinta">
                    <td className="px-3.5 py-3">
                      <span className="flex items-center gap-3">
                        <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-aqua text-xs font-extrabold text-cerceta-oscuro">
                          {iniciales(`${u.nombres} ${u.apellidos}`)}
                        </span>
                        <span className="font-bold">
                          {u.nombres} {u.apellidos}
                        </span>
                      </span>
                    </td>
                    <td className="px-3.5">
                      {u.tipoDocumento} {u.numeroDocumento}
                    </td>
                    <td className="px-3.5">
                      <span className="block">{u.email}</span>
                      {u.telefono && <span className="block text-[11px] text-tinta-tenue">{u.telefono}</span>}
                    </td>
                    <td className="px-3.5">
                      <Pildora tono={u.rol === "ADMIN" ? "aqua" : "menta"}>{PERFIL_ETIQUETA[u.rol]}</Pildora>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
