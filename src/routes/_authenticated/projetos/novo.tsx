import { createFileRoute } from "@tanstack/react-router";
import { ProjectForm } from "@/components/app/ProjectForm";
import { PageHeader } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/projetos/novo")({
  head: () => ({ meta: [{ title: "Novo projeto — Freela Hub" }, { name: "description", content: "Cadastrar novo projeto." }] }),
  component: () => (
    <>
      <PageHeader title="Novo projeto" />
      <ProjectForm />
    </>
  ),
});
