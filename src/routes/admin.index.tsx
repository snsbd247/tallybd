import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Store, CheckCircle2, XCircle, Lock, Package, MessageSquare, Sparkles, ArrowUpRight, Activity, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const fn = useServerFn(getAdminStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "মোট দোকান", value: data?.totalShops ?? 0, icon: Store, grad: "grad-blue", soft: "soft-blue", trend: "সব দোকান" },
    { label: "একটিভ", value: data?.activeShops ?? 0, icon: CheckCircle2, grad: "grad-emerald", soft: "soft-emerald", trend: "চলমান সাবস্ক্রিপশন" },
    { label: "মেয়াদ শেষ", value: data?.expiredShops ?? 0, icon: XCircle, grad: "grad-amber", soft: "soft-amber", trend: "রিনিউ প্রয়োজন" },
    { label: "লকড", value: data?.lockedShops ?? 0, icon: Lock, grad: "grad-rose", soft: "soft-rose", trend: "সাসপেন্ডেড" },
    { label: "প্যাকেজ", value: data?.totalPackages ?? 0, icon: Package, grad: "grad-violet", soft: "soft-violet", trend: "প্ল্যান সংখ্যা" },
    { label: "SMS পাঠানো", value: data?.smsSent ?? 0, icon: MessageSquare, grad: "grad-cyan", soft: "soft-cyan", trend: "মোট ডেলিভারি" },
  ];

  const shortcuts = [
    { to: "/admin/shops", label: "দোকান", icon: Store, grad: "grad-ocean" },
    { to: "/admin/subscriptions", label: "সাবস্ক্রিপশন", icon: Activity, grad: "grad-forest" },
    { to: "/admin/packages", label: "প্যাকেজ", icon: Package, grad: "grad-violet" },
    { to: "/admin/sms-logs", label: "SMS লগ", icon: MessageSquare, grad: "grad-sunset" },
  ];

  return (
    <AdminShell>
      <div className="p-4 sm:p-6">
        {/* Hero banner */}
        <div className="grad-ocean relative overflow-hidden rounded-2xl p-5 shadow-lg sm:p-7">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
          <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
                <Sparkles className="h-3 w-3" /> সুপার এডমিন প্যানেল
              </div>
              <h1 className="mt-3 text-2xl font-bold sm:text-3xl">ড্যাশবোর্ড</h1>
              <p className="mt-1 text-sm opacity-90">সব দোকান, সাবস্ক্রিপশন ও কার্যক্রমের এক নজরে ওভারভিউ</p>
            </div>
            <div className="hidden shrink-0 rounded-2xl bg-white/15 p-4 backdrop-blur sm:block">
              <TrendingUp className="h-10 w-10" />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className={`card-hover relative overflow-hidden rounded-xl border p-5 shadow-sm ${c.soft}`}>
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">{c.label}</p>
                  <p className="mt-2 text-3xl font-extrabold leading-none text-slate-900">{c.value}</p>
                  <p className="mt-2 text-xs text-slate-600">{c.trend}</p>
                </div>
                <div className={`shrink-0 rounded-xl p-2.5 shadow-md ${c.grad}`}>
                  <c.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Shortcuts */}
        <div className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">দ্রুত অ্যাকসেস</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {shortcuts.map((s) => (
              <Link key={s.to} to={s.to}
                className={`card-hover group relative overflow-hidden rounded-xl p-4 shadow-md ${s.grad}`}>
                <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-white/20 p-2 backdrop-blur">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-semibold">{s.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
