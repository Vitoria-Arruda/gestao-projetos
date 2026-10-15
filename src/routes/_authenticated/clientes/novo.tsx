import { createFileRoute } from "@tanstack/react-router";
import { ClientForm } from "@/components/app/ClientForm";
import { PageHeader } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/clientes/novo")({
  head: () => ({ meta: [{ title: "Novo cliente — Freela Hub" }, { name: "description", content: "Cadastrar cliente." }] }),
  component: () => (
    <>
      <PageHeader title="Novo cliente" />
      <ClientForm />
    </>
  ),
});
