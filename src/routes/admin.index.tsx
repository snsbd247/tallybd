import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAdminStats } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Store, CheckCircle2, XCircle, Lock, Package, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: Dashboard });

function Dashboard() {
  const fn = useServerFn(getAdminStats);
  const { data } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  const cards = [
    { label: "মোট দোকান", value: data?.totalShops ?? 0, icon: Store, color: "text-blue-600" },
    { label: "একটিভ", value: data?.activeShops ?? 0, icon: CheckCircle2, color: "text-green-600" },
    { label: "মেয়াদ শেষ", value: data?.expiredShops ?? 0, icon: XCircle, color: "text-orange-600" },
    { label: "লকড", value: data?.lockedShops ?? 0, icon: Lock, color: "text-red-600" },
    { label: "প্যাকেজ", value: data?.totalPackages ?? 0, icon: Package, color: "text-purple-600" },
    { label: "SMS পাঠানো", value: data?.smsSent ?? 0, icon: MessageSquare, color: "text-cyan-600" },
  ];

  return (
    <AdminShell>
      <div className="p-4 sm:p-6">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">ড্যাশবোর্ড</h1>
          <p className="text-sm text-muted-foreground">সংক্ষিপ্ত ওভারভিউ</p>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border bg-card p-4 shadow-sm sm:p-5">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-muted-foreground">{c.label}</p>
                  <p className="mt-1 text-3xl font-bold leading-none">{c.value}</p>
                </div>
                <c.icon className={`h-8 w-8 shrink-0 ${c.color}`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
