import type { Metadata } from "next";
import { PanelFila } from "@/presentation/components/fila/panel-fila";

export const metadata: Metadata = { title: "Cola de atención" };

export default function FilaPage() {
  return <PanelFila />;
}
