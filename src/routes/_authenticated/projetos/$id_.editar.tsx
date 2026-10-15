import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { projectQuery } from "@/lib/api";
import { ProjectForm } from "@/components/app/ProjectForm";
import { PageHeader } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/projetos/$id_/editar")({
  head: () => ({ meta: [{ title: "Editar projeto — Freela Hub" }, { name: "description", content: "Editar projeto." }] }),
  component: Edit,
});

function Edit() {
  const { id } = Route.useParams();
  const { data } = useQuery(projectQuery(id));
  return (
    <>
      <PageHeader title="Editar projeto" />
      {data && <ProjectForm key={data.id} project={data} />}
    </>
  );
}
