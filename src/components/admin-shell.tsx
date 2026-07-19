import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LayoutDashboard, Store, Package, Settings, LogOut, ShieldCheck, CreditCard, MessageSquare, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import type { ReactNode } from "react";

const nav: { to: string; label: string; icon: any; exact?: boolean }[] = [
  { to: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { to: "/admin/shops", label: "দোকান সমূহ", icon: Store },
  { to: "/admin/subscriptions", label: "পেমেন্ট", icon: CreditCard },
  { to: "/admin/packages", label: "প্যাকেজ", icon: Package },
  { to: "/admin/sms-logs", label: "SMS লগ", icon: MessageSquare },
  { to: "/admin/settings", label: "সেটিংস", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => { setOpen(false); }, [loc.pathname]);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
      {nav.map((n) => {
        const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
        return (
          <Link key={n.to} to={n.to} onClick={onClick}
            className={`flex min-w-0 items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors ${
              active ? "bg-primary text-primary-foreground" : "hover:bg-slate-800"
            }`}>
            <n.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{n.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const Brand = () => (
    <div className="flex min-w-0 items-center gap-2 border-b border-slate-800 px-4 py-4 pr-12">
      <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
      <span className="truncate font-bold">Supershop Admin</span>
    </div>
  );

  const current = nav.find((n) => n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to));

  return (
    <div className="flex min-h-dvh">
      <aside className="hidden w-60 flex-col border-r bg-slate-900 text-slate-100 md:flex">
        <Brand />
        <NavList />
        <div className="border-t border-slate-800 p-2">
          <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> লগআউট
          </Button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col bg-muted/30">
        <div className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b bg-slate-900 px-3 py-2.5 text-slate-100 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-9 shrink-0 gap-2 px-3 text-slate-100 hover:bg-slate-800 hover:text-white" aria-label="মেন্যু খুলুন">
                <Menu className="h-5 w-5" />
                <span className="text-sm font-medium">মেন্যু</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[min(84vw,20rem)] border-slate-800 bg-slate-900 p-0 text-slate-100">
              <SheetTitle className="sr-only">মেন্যু</SheetTitle>
              <div className="flex h-full flex-col">
                <Brand />
                <NavList onClick={() => setOpen(false)} />
                <div className="border-t border-slate-800 p-2">
                  <Button variant="ghost" className="w-full justify-start text-slate-300 hover:bg-slate-800 hover:text-white" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" /> লগআউট
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <div className="min-w-0">
              <div className="truncate text-sm font-bold">Supershop Admin</div>
              <div className="truncate text-xs text-slate-300">{current?.label ?? "এডমিন প্যানেল"}</div>
            </div>
          </div>
        </div>
        <div className="min-w-0 flex-1 overflow-x-auto pb-[calc(1rem+env(safe-area-inset-bottom))]">{children}</div>
      </main>
    </div>
  );
}
