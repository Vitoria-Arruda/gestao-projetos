import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Project = Database["public"]["Tables"]["projects"]["Row"];
export type Step = Database["public"]["Tables"]["project_steps"]["Row"];
export type Settings = Database["public"]["Tables"]["pricing_settings"]["Row"];

const unwrap = <T,>(r: { data: T | null; error: { message: string } | null }) => {
  if (r.error) throw new Error(r.error.message);
  return r.data as T;
};

export const clientsQuery = queryOptions({
  queryKey: ["clients"],
  queryFn: async () => unwrap(await supabase.from("clients").select("*").order("name")) as Client[],
});

export const projectsQuery = queryOptions({
  queryKey: ["projects"],
  queryFn: async () =>
    unwrap(await supabase.from("projects").select("*").order("deadline", { ascending: true, nullsFirst: false })) as Project[],
});

export const projectQuery = (id: string) =>
  queryOptions({
    queryKey: ["projects", id],
    queryFn: async () => unwrap(await supabase.from("projects").select("*").eq("id", id).single()) as Project,
  });

export const stepsQuery = (projectId: string) =>
  queryOptions({
    queryKey: ["steps", projectId],
    queryFn: async () =>
      unwrap(
        await supabase.from("project_steps").select("*").eq("project_id", projectId).order("position").order("created_at"),
      ) as Step[],
  });

export const settingsQuery = queryOptions({
  queryKey: ["settings"],
  queryFn: async () => {
    const r = await supabase.from("pricing_settings").select("*").maybeSingle();
    if (r.error) throw new Error(r.error.message);
    return (r.data ?? { hourly_rate: 100, margin: 20, complexity: 1 }) as Pick<Settings, "hourly_rate" | "margin" | "complexity">;
  },
});
