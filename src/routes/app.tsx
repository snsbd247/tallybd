import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Store, LogOut, CreditCard } from "lucide-react";

export const Route = createFileRoute("/app")({ ssr: false, component: AppLayout });

function AppLayout() {
  const { loading, session, primaryShopId } = useAuth();
  const navigate = useNavigate();
  const fn = useServerFn(getMyShop);
  const shopQ = useQuery({ queryKey: ["my-shop"], queryFn: () => fn(), enabled: !!session });

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/login" });
    else if (!primaryShopId) navigate({ to: "/" });
  }, [loading, session, primaryShopId, navigate]);

  useEffect(() => {
    if (shopQ.data?.shop && ["expired", "locked", "suspended"].includes(shopQ.data.shop.status)) {
      navigate({ to: "/renew" });
    }
  }, [shopQ.data, navigate]);

  if (loading || !session || shopQ.isLoading) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">লোড হচ্ছে...</div>;
  }

  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };
  const loc = useLocation();

  const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
    { to: "/app", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
    { to: "/app/subscription", label: "সাবস্ক্রিপশন", icon: CreditCard },
  ];

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-60 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 border-b px-4 py-4">
          <Store className="h-5 w-5 text-primary" />
          <div>
            <div className="text-sm font-bold">{shopQ.data?.shop?.name}</div>
            <div className="text-xs text-muted-foreground">{shopQ.data?.shop?.owner_name}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          {nav.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm ${active ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t p-2">
          <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> লগআউট
          </Button>
        </div>
      </aside>
      <main className="flex-1 bg-muted/30">
        <Outlet />
      </main>
    </div>
  );
}
