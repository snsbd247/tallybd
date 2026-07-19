import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Store, Package, Settings, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/shops", label: "দোকান সমূহ", icon: Store },
  { to: "/admin/packages", label: "প্যাকেজ", icon: Package },
  { to: "/admin/settings", label: "সেটিংস", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-slate-900 text-slate-100 md:flex">
        <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <span className="font-bold">Supershop Admin</span>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {nav.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  active ? "bg-primary text-primary-foreground" : "hover:bg-slate-800"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 p-2">
          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> লগআউট
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-muted/30">{children}</main>
    </div>
  );
}
