import { redirect } from "next/navigation";

/** Ruta anterior: la farmacia ahora vive en /medicamentos. */
export default function FarmaciaPage() {
  redirect("/medicamentos");
}
