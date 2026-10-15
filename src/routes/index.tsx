import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Freela Hub — Seu painel de projetos" },
      { name: "description", content: "Painel para freelancers gerenciarem clientes, projetos, etapas e preços." },
      { property: "og:title", content: "Freela Hub — Seu painel de projetos" },
      { property: "og:description", content: "Painel para freelancers gerenciarem clientes, projetos, etapas e preços." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    throw redirect({ to: data.session ? "/dashboard" : "/auth" });
  },
});
