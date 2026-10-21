import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Calculator, FolderKanban, LayoutDashboard, LogOut, Settings2, Users, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Layout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projetos", label: "Projetos", icon: FolderKanban },
  { to: "/clientes", label: "Clientes", icon: Users },
  { to: "/calculadora", label: "Calculadora", icon: Calculator },
  { to: "/parametros", label: "Parâmetros", icon: Settings2 },
] as const;

function Layout() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const navigate = useNavigate();

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-background md:flex-row">
      <aside className="min-w-0 shrink-0 border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:flex md:h-screen md:w-60 md:flex-col md:border-b-0 md:border-r">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <LayoutGrid className="size-4" />
          </div>
          <span className="font-display text-lg font-bold">Freela Hub</span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-1 md:flex-col md:pb-0">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-accent-foreground font-medium" }}
            >
              <n.icon className="size-4" />
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden border-t border-sidebar-border p-4 md:block">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <button onClick={signOut} className="mt-2 flex items-center gap-2 text-sm text-sidebar-foreground/75 hover:text-sidebar-foreground">
            <LogOut className="size-4" /> Sair
          </button>
        </div>
        <button onClick={signOut} className="flex items-center gap-2 px-5 pb-3 text-sm text-muted-foreground md:hidden">
          <LogOut className="size-4" /> Sair
        </button>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-10">
        <div className="mx-auto min-w-0 max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
