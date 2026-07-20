import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { getReportSnapshot } from "@/lib/reports.functions";
import { listSales } from "@/lib/sales.functions";
import { listInstallments } from "@/lib/sales.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Wallet, TrendingUp, TrendingDown, Users, Receipt, CalendarClock, ShoppingCart, ArrowRight, AlertTriangle, Sparkles, ArrowUpRight } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: ShopDashboard });

const fmt = (n: number) => `৳${Number(n || 0).toLocaleString("bn-BD", { maximumFractionDigits: 0 })}`;

function ShopDashboard() {
  const shopFn = useServerFn(getMyShop);
  const snapFn = useServerFn(getReportSnapshot);
  const salesFn = useServerFn(listSales);
  const instFn = useServerFn(listInstallments);

  const { data } = useQuery({ queryKey: ["my-shop"], queryFn: () => shopFn() });
  const snapQ = useQuery({ queryKey: ["report-snap"], queryFn: () => snapFn() });
  const recentSalesQ = useQuery({ queryKey: ["recent-sales"], queryFn: () => salesFn({ data: {} }) });
  const overdueQ = useQuery({ queryKey: ["overdue-inst"], queryFn: () => instFn({ data: { status: "overdue" } }) });

  const shop = data?.shop;
  const end = shop?.subscription_end ? new Date(shop.subscription_end) : null;
  const daysLeft = end ? Math.ceil((end.getTime() - Date.now()) / (24 * 3600 * 1000)) : 0;
  const snap = snapQ.data;

  const recent = (recentSalesQ.data ?? []).slice(0, 6);
  const overdue = (overdueQ.data as any)?.rows ?? [];

  const stats = [
    { label: "আজকের বিক্রয়", value: fmt(snap?.sales_today ?? 0), icon: TrendingUp, grad: "grad-emerald", soft: "soft-emerald" },
    { label: "এ মাসের বিক্রয়", value: fmt(snap?.sales_month ?? 0), icon: Receipt, grad: "grad-blue", soft: "soft-blue" },
    { label: "এ মাসের ক্রয়", value: fmt(snap?.purchase_month ?? 0), icon: TrendingDown, grad: "grad-amber", soft: "soft-amber" },
    { label: "কাস্টমার বাকি", value: fmt(snap?.customer_due ?? 0), icon: Wallet, grad: "grad-rose", soft: "soft-rose" },
  ];

  const actions = [
    { to: "/app/sales/new", label: "নতুন বিক্রয়", icon: Receipt, grad: "grad-emerald" },
    { to: "/app/purchases/new", label: "নতুন ক্রয়", icon: ShoppingCart, grad: "grad-ocean" },
    { to: "/app/products", label: "পণ্য", icon: Package, grad: "grad-violet" },
    { to: "/app/customers", label: "কাস্টমার", icon: Users, grad: "grad-sunset" },
  ];

  return (
    <div className="space-y-5 p-4 sm:p-6">
      {/* Hero */}
      <div className="grad-ocean relative overflow-hidden rounded-2xl p-5 shadow-lg sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-medium backdrop-blur">
              <Sparkles className="h-3 w-3" /> স্বাগতম
            </div>
            <h1 className="mt-3 truncate text-2xl font-bold sm:text-3xl">{shop?.owner_name}</h1>
            <p className="mt-1 text-sm opacity-90">{shop?.name} • প্যাকেজ: {shop?.package?.name ?? "-"}</p>
          </div>
          {daysLeft <= 7 && daysLeft >= 0 && (
            <Link to="/app/subscription" className="shrink-0">
              <Badge variant={daysLeft <= 2 ? "destructive" : "secondary"} className="gap-1 shadow-md">
                <AlertTriangle className="h-3 w-3" /> {daysLeft} দিনে শেষ
              </Badge>
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className={`card-hover relative overflow-hidden rounded-xl border p-5 shadow-sm ${s.soft}`}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-slate-700">{s.label}</p>
                <p className="mt-2 text-2xl font-extrabold leading-tight text-slate-900">{s.value}</p>
              </div>
              <div className={`shrink-0 rounded-xl p-2.5 shadow-md ${s.grad}`}>
                <s.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((a) => (
          <Link key={a.to} to={a.to}
            className={`card-hover group relative overflow-hidden rounded-xl p-4 shadow-md ${a.grad}`}>
            <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/15 blur-xl" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white/20 p-2 backdrop-blur">
                  <a.icon className="h-5 w-5" />
                </div>
                <span className="font-semibold">{a.label}</span>
              </div>
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="grad-blue px-5 py-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <h2 className="font-semibold">সাম্প্রতিক বিক্রয়</h2>
                <Link to="/app/sales" className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur hover:bg-white/30">
                  সব দেখুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
            <CardContent className="p-4 sm:p-5">
              {recent.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">এখনো বিক্রয় নেই</p>
              ) : (
                <div className="divide-y">
                  {recent.map((s: any) => (
                    <Link key={s.id} to="/app/sales/$saleId" params={{ saleId: s.id }}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded px-2 py-2.5 text-sm hover:bg-muted/50">
                      <div className="min-w-0">
                        <div className="font-medium">{s.invoice_no ?? s.id.slice(0, 8)}</div>
                        <div className="text-xs text-muted-foreground">{s.customer?.name ?? "Walk-in"} • {new Date(s.sale_date).toLocaleDateString("bn-BD")}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{fmt(s.total)}</div>
                        {Number(s.due) > 0 && <div className="text-xs text-orange-600">বাকি: {fmt(s.due)}</div>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="grad-rose px-5 py-3">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="flex items-center gap-2 font-semibold"><CalendarClock className="h-4 w-4" /> বকেয়া কিস্তি</h2>
              <Link to="/app/installments" className="rounded-full bg-white/20 px-2.5 py-1 text-xs backdrop-blur hover:bg-white/30">সব</Link>
            </div>
          </div>
          <CardContent className="p-4 sm:p-5">
            {overdue.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">সব ক্লিয়ার ✓</p>
            ) : (
              <div className="space-y-2">
                {overdue.slice(0, 6).map((i: any) => (
                  <div key={i.id} className="rounded-md border p-2.5 text-sm">
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                      <span className="truncate font-medium">{i.sale?.customer?.name ?? "-"}</span>
                      <span className="font-semibold text-destructive">{fmt(Number(i.amount) - Number(i.paid_amount || 0))}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{i.due_date} • #{i.sale?.invoice_no}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
