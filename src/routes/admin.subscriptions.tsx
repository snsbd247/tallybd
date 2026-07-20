import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listSubscriptionPayments,
  approveSubscriptionPayment,
  rejectSubscriptionPayment,
  syncExpiredShops,
  getPaymentReceipt,
} from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Check, X, RefreshCw, Download } from "lucide-react";
import jsPDF from "jspdf";


export const Route = createFileRoute("/admin/subscriptions")({ component: Page });

function Page() {
  const [tab, setTab] = useState<"pending" | "success" | "failed" | "all">("pending");
  const qc = useQueryClient();
  const listFn = useServerFn(listSubscriptionPayments);
  const approveFn = useServerFn(approveSubscriptionPayment);
  const rejectFn = useServerFn(rejectSubscriptionPayment);
  const syncFn = useServerFn(syncExpiredShops);

  const q = useQuery({
    queryKey: ["admin-payments", tab],
    queryFn: () => listFn({ data: { status: tab } }),
  });

  const approve = useMutation({
    mutationFn: (id: string) => approveFn({ data: { payment_id: id } }),
    onSuccess: () => { toast.success("অনুমোদন হয়েছে, একাউন্ট এক্টিভ"); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.message),
  });
  const reject = useMutation({
    mutationFn: (id: string) => rejectFn({ data: { payment_id: id } }),
    onSuccess: () => { toast.success("বাতিল হয়েছে"); qc.invalidateQueries(); },
    onError: (e: any) => toast.error(e.message),
  });
  const sync = useMutation({
    mutationFn: () => syncFn(),
    onSuccess: (r: any) => { toast.success(`${r.updated}টি দোকান expired মার্ক হয়েছে`); qc.invalidateQueries(); },
  });

  return (
    <AdminShell>
      <div className="p-4 sm:p-6">
        <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">সাবস্ক্রিপশন পেমেন্ট</h1>
            <p className="text-sm text-muted-foreground">দোকানদারের বিকাশ পেমেন্ট রিভিউ ও অনুমোদন করুন</p>
          </div>
          <Button className="shrink-0" variant="outline" onClick={() => sync.mutate()} disabled={sync.isPending}>
            <RefreshCw className="mr-2 h-4 w-4" /> মেয়াদ শেষ চেক
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
          <TabsList className="h-auto max-w-full justify-start overflow-x-auto p-1">
            <TabsTrigger value="pending">অপেক্ষমান</TabsTrigger>
            <TabsTrigger value="success">অনুমোদিত</TabsTrigger>
            <TabsTrigger value="failed">বাতিল</TabsTrigger>
            <TabsTrigger value="all">সব</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="mt-4 space-y-3">
          {q.data?.length === 0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">কোন পেমেন্ট নেই</Card>
          )}
          {q.data?.map((p: any) => (
            <Card key={p.id} className="p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0 space-y-1">
                  <div className="font-semibold">{p.shop?.name} <span className="text-xs text-muted-foreground">({p.shop?.owner_name})</span></div>
                  <div className="text-xs text-muted-foreground">📞 {p.shop?.phone}</div>
                  <div className="text-sm">TrxID: <span className="font-mono font-medium">{p.transaction_id ?? "-"}</span></div>
                  {p.bkash_payment_id && <div className="text-xs">bKash নম্বর: {p.bkash_payment_id}</div>}
                  <div className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleString("bn-BD")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">৳{Number(p.amount).toLocaleString("bn-BD")}</div>
                  <Badge variant={p.status === "pending" ? "secondary" : p.status === "success" ? "default" : "destructive"} className="mt-1">
                    {p.status === "pending" ? "অপেক্ষমান" : p.status === "success" ? "অনুমোদিত" : "বাতিল"}
                  </Badge>
                </div>
              </div>
              {p.status === "pending" && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => approve.mutate(p.id)} disabled={approve.isPending}>
                    <Check className="mr-1 h-4 w-4" /> অনুমোদন
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => reject.mutate(p.id)} disabled={reject.isPending}>
                    <X className="mr-1 h-4 w-4" /> বাতিল
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
