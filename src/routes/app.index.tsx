import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { getReportSnapshot } from "@/lib/reports.functions";
import { listSales } from "@/lib/sales.functions";
import { listInstallments } from "@/lib/sales.functions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Wallet, TrendingUp, TrendingDown, Users, Receipt, CalendarClock, ShoppingCart, ArrowRight, AlertTriangle } from "lucide-react";

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
  const overdueQ = useQuery({ queryKey: ["overdue-inst"], queryFn: () => instFn({ data: { filter: "overdue" } }) });

  const shop = data?.shop;
  const end = shop?.subscription_end ? new Date(shop.subscription_end) : null;
  const daysLeft = end ? Math.ceil((end.getTime() - Date.now()) / (24 * 3600 * 1000)) : 0;
  const snap = snapQ.data;

  const recent = (recentSalesQ.data ?? []).slice(0, 6);
  const overdue = (overdueQ.data as any)?.rows ?? [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">স্বাগতম, {shop?.owner_name}</h1>
          <p className="text-sm text-muted-foreground">{shop?.name} • প্যাকেজ: {shop?.package?.name ?? "-"}</p>
        </div>
        {daysLeft <= 7 && daysLeft >= 0 && (
          <Link to="/app/subscription">
            <Badge variant={daysLeft <= 2 ? "destructive" : "secondary"} className="gap-1">
              <AlertTriangle className="h-3 w-3" /> সাবস্ক্রিপশন {daysLeft} দিনে শেষ
            </Badge>
          </Link>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="আজকের বিক্রয়" value={fmt(snap?.sales_today ?? 0)} icon={<TrendingUp className="h-5 w-5 text-emerald-600" />} />
        <Stat label="এ মাসের বিক্রয়" value={fmt(snap?.sales_month ?? 0)} icon={<Receipt className="h-5 w-5 text-primary" />} />
        <Stat label="এ মাসের ক্রয়" value={fmt(snap?.purchase_month ?? 0)} icon={<TrendingDown className="h-5 w-5 text-amber-600" />} />
        <Stat label="কাস্টমার বাকি" value={fmt(snap?.customer_due ?? 0)} icon={<Wallet className="h-5 w-5 text-destructive" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="font-semibold">সাম্প্রতিক বিক্রয়</h2>
                <Link to="/app/sales" className="text-xs text-primary hover:underline flex items-center gap-1">
                  সব দেখুন <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              {recent.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">এখনো বিক্রয় নেই</p>
              ) : (
                <div className="divide-y">
                  {recent.map((s: any) => (
                    <Link key={s.id} to="/app/sales/$saleId" params={{ saleId: s.id }}
                      className="flex items-center justify-between py-2 text-sm hover:bg-muted/50 rounded px-2">
                      <div>
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

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-3 font-semibold">দ্রুত কাজ</h2>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <QuickAction to="/app/sales/new" label="নতুন বিক্রয়" icon={<Receipt className="h-4 w-4" />} />
                <QuickAction to="/app/purchases/new" label="নতুন ক্রয়" icon={<ShoppingCart className="h-4 w-4" />} />
                <QuickAction to="/app/products" label="পণ্য" icon={<Package className="h-4 w-4" />} />
                <QuickAction to="/app/customers" label="কাস্টমার" icon={<Users className="h-4 w-4" />} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2"><CalendarClock className="h-4 w-4" /> বকেয়া কিস্তি</h2>
              <Link to="/app/installments" className="text-xs text-primary hover:underline">সব</Link>
            </div>
            {overdue.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">সব ক্লিয়ার ✓</p>
            ) : (
              <div className="space-y-2">
                {overdue.slice(0, 6).map((i: any) => (
                  <div key={i.id} className="rounded-md border p-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">{i.sale?.customer?.name ?? "-"}</span>
                      <span className="text-destructive font-semibold">{fmt(Number(i.amount) - Number(i.paid_amount || 0))}</span>
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

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <Card><CardContent className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}<span>{label}</span></div>
      <div className="mt-2 text-xl font-bold">{value}</div>
    </CardContent></Card>
  );
}

function QuickAction({ to, label, icon }: { to: string; label: string; icon: React.ReactNode }) {
  return (
    <Link to={to}>
      <Button variant="outline" className="w-full justify-start gap-2">{icon} {label}</Button>
    </Link>
  );
}
