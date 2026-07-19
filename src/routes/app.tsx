import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { getShopNotifications } from "@/lib/notifications.functions";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { LayoutDashboard, Store, LogOut, CreditCard, Package, Tag, Ruler, Boxes, Truck, ShoppingCart, Users, Receipt, CalendarClock, BarChart3, Bell } from "lucide-react";

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
    { to: "/app/products", label: "পণ্য", icon: Package },
    { to: "/app/categories", label: "ক্যাটাগরি", icon: Tag },
    { to: "/app/units", label: "একক", icon: Ruler },
    { to: "/app/stock", label: "স্টক", icon: Boxes },
    { to: "/app/suppliers", label: "সাপ্লায়ার", icon: Truck },
    { to: "/app/purchases", label: "ক্রয়", icon: ShoppingCart },
    { to: "/app/customers", label: "কাস্টমার", icon: Users },
    { to: "/app/sales", label: "বিক্রয়", icon: Receipt },
    { to: "/app/installments", label: "কিস্তি", icon: CalendarClock },
    { to: "/app/reports", label: "রিপোর্ট", icon: BarChart3 },
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
        <div className="flex items-center justify-end border-b bg-card px-4 py-2 md:px-6">
          <NotificationsBell />
        </div>
        <Outlet />
      </main>
    </div>
  );
}

function NotificationsBell() {
  const fn = useServerFn(getShopNotifications);
  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fn(),
    refetchInterval: 60_000,
  });
  const items = data?.items ?? [];
  const count = data?.count ?? 0;
  const severityColor = (s: string) => s === "danger" ? "text-destructive" : s === "warn" ? "text-amber-600" : "text-muted-foreground";
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 rounded-full px-1 text-[10px]" variant="destructive">{count}</Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-2 font-semibold text-sm">নোটিফিকেশন</div>
        {items.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">সব ক্লিয়ার ✓</div>
        ) : (
          <div className="max-h-80 divide-y overflow-y-auto">
            {items.map((n: any, i: number) => (
              <Link key={i} to={n.href ?? "/app"} className="block px-4 py-3 hover:bg-muted/50">
                <div className={`text-sm font-medium ${severityColor(n.severity)}`}>{n.title}</div>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </Link>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
