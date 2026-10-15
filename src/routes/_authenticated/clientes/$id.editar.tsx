import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { clientsQuery } from "@/lib/api";
import { ClientForm } from "@/components/app/ClientForm";
import { PageHeader } from "@/components/app/ui-bits";

export const Route = createFileRoute("/_authenticated/clientes/$id/editar")({
  head: () => ({ meta: [{ title: "Editar cliente — Freela Hub" }, { name: "description", content: "Editar cliente." }] }),
  component: Edit,
});

function Edit() {
  const { id } = Route.useParams();
  const client = useQuery(clientsQuery).data?.find((c) => c.id === id);
  return (
    <>
      <PageHeader title="Editar cliente" />
      {client && <ClientForm key={client.id} client={client} />}
    </>
  );
}
