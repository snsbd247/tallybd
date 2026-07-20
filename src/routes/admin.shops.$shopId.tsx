import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getShopDetail, updateShop, deleteShop, listPackages, updateShopStatus, extendShopSubscription } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Lock, Unlock, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/admin/shops/$shopId")({ component: ShopDetail });

function ShopDetail() {
  const { shopId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const getFn = useServerFn(getShopDetail);
  const updateFn = useServerFn(updateShop);
  const deleteFn = useServerFn(deleteShop);
  const pkgsFn = useServerFn(listPackages);
  const statusFn = useServerFn(updateShopStatus);
  const extendFn = useServerFn(extendShopSubscription);

  const q = useQuery({ queryKey: ["shop-detail", shopId], queryFn: () => getFn({ data: { shop_id: shopId } }) });
  const pkgs = useQuery({ queryKey: ["packages"], queryFn: () => pkgsFn() });

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [form, setForm] = useState<any>(null);

  const shop = q.data?.shop;

  const openEdit = () => {
    if (!shop) return;
    setForm({
      shop_id: shop.id,
      name: shop.name, owner_name: shop.owner_name, phone: shop.phone,
      email: shop.email, address: shop.address ?? "",
      package_id: shop.package_id, billing_cycle: shop.billing_cycle ?? "monthly",
    });
    setEditOpen(true);
  };


  const saveMut = useMutation({
    mutationFn: () => updateFn({ data: form }),
    onSuccess: () => { toast.success("আপডেট হয়েছে"); qc.invalidateQueries({ queryKey: ["shop-detail", shopId] }); setEditOpen(false); },
    onError: (e: any) => toast.error(e.message),
  });

  const delMut = useMutation({
    mutationFn: () => deleteFn({ data: { shop_id: shopId } }),
    onSuccess: () => { toast.success("দোকান ডিলিট হয়েছে"); navigate({ to: "/admin/shops" }); },
    onError: (e: any) => toast.error(e.message),
  });

  if (q.isLoading) return <AdminShell><div className="p-6">লোড হচ্ছে...</div></AdminShell>;
  if (!shop) return <AdminShell><div className="p-6">দোকান পাওয়া যায়নি</div></AdminShell>;

  return (
    <AdminShell>
      <div className="p-4 sm:p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon"><Link to="/admin/shops"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{shop.name}</h1>
              <p className="text-sm text-muted-foreground">{shop.owner_name} • {shop.phone}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => extendFn({ data: { shop_id: shopId, months: 1 } }).then(() => { toast.success("১ মাস বাড়ানো হলো"); qc.invalidateQueries(); })}>
              <CalendarPlus className="mr-1 h-4 w-4" /> ১ মাস
            </Button>
            <Button size="sm" variant="outline" onClick={() => statusFn({ data: { shop_id: shopId, status: shop.status === "locked" ? "active" : "locked" } }).then(() => { toast.success("আপডেট"); qc.invalidateQueries(); })}>
              {shop.status === "locked" ? <><Unlock className="mr-1 h-4 w-4" />আনলক</> : <><Lock className="mr-1 h-4 w-4" />লক</>}
            </Button>
            <Button size="sm" onClick={openEdit}><Pencil className="mr-1 h-4 w-4" />ইডিট</Button>
            <Button size="sm" variant="destructive" onClick={() => setDelOpen(true)}><Trash2 className="mr-1 h-4 w-4" />ডিলিট</Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <h2 className="mb-3 font-semibold">দোকানের তথ্য</h2>
            <dl className="space-y-2 text-sm">
              <Row k="ইমেইল" v={shop.email} />
              <Row k="ঠিকানা" v={shop.address ?? "-"} />
              <Row k="প্যাকেজ" v={shop.package?.name ?? "-"} />
              <Row k="বিলিং" v={shop.billing_cycle === "yearly" ? "বাৎসরিক" : "মাসিক"} />
              <Row k="স্ট্যাটাস" v={<StatusBadge status={shop.status} />} />
              <Row k="শুরু" v={shop.subscription_start ? new Date(shop.subscription_start).toLocaleDateString("bn-BD") : "-"} />
              <Row k="মেয়াদ শেষ" v={shop.subscription_end ? new Date(shop.subscription_end).toLocaleDateString("bn-BD") : "-"} />
              <Row k="তৈরি" v={new Date(shop.created_at).toLocaleString("bn-BD")} />
            </dl>
          </Card>

          <Card className="p-5">
            <h2 className="mb-3 font-semibold">সাবস্ক্রিপশন হিস্ট্রি</h2>
            <div className="space-y-2 text-sm">
              {q.data?.subscriptions?.length === 0 && <p className="text-muted-foreground">কোন সাবস্ক্রিপশন নেই</p>}
              {q.data?.subscriptions?.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded border p-2">
                  <div>
                    <div className="font-medium">{s.package?.name}</div>
                    <div className="text-xs text-muted-foreground">{new Date(s.starts_at).toLocaleDateString("bn-BD")} → {new Date(s.ends_at).toLocaleDateString("bn-BD")}</div>
                  </div>
                  <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold">সাম্প্রতিক পেমেন্ট</h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-sm">
              <thead className="bg-muted/50 text-left">
                <tr><th className="p-2">তারিখ</th><th className="p-2">TrxID</th><th className="p-2">এমাউন্ট</th><th className="p-2">স্ট্যাটাস</th></tr>
              </thead>
              <tbody>
                {q.data?.payments?.length === 0 && (<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">কোন পেমেন্ট নেই</td></tr>)}
                {q.data?.payments?.map((p: any) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-2">{new Date(p.created_at).toLocaleDateString("bn-BD")}</td>
                    <td className="p-2 font-mono text-xs">{p.transaction_id ?? "-"}</td>
                    <td className="p-2">৳{Number(p.amount).toLocaleString("bn-BD")}</td>
                    <td className="p-2"><Badge variant={p.status === "success" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>দোকান ইডিট</DialogTitle></DialogHeader>
          {form && (
            <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>দোকানের নাম</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>মালিকের নাম</Label><Input required value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></div>
                <div><Label>ফোন</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>ইমেইল</Label><Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>ঠিকানা</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label>প্যাকেজ</Label>
                  <Select value={form.package_id ?? ""} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {pkgs.data?.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>বিলিং</Label>
                  <Select value={form.billing_cycle} onValueChange={(v) => setForm({ ...form, billing_cycle: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="monthly">মাসিক</SelectItem><SelectItem value="yearly">বাৎসরিক</SelectItem></SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter><Button type="submit" disabled={saveMut.isPending}>সেভ করুন</Button></DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>দোকান ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>
              এই কাজটি বাতিল করা যাবে না। দোকানের সব ডাটা (পণ্য, বিক্রি, ক্রয়) এবং মালিকের একাউন্ট মুছে যাবে।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>বাতিল</AlertDialogCancel>
            <AlertDialogAction onClick={() => delMut.mutate()} className="bg-destructive text-destructive-foreground">ডিলিট</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex justify-between gap-3 border-b border-dashed pb-1 last:border-0">
      <dt className="text-muted-foreground">{k}</dt>
      <dd className="text-right font-medium">{v}</dd>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: any }> = {
    active: { label: "একটিভ", variant: "default" },
    expired: { label: "মেয়াদ শেষ", variant: "secondary" },
    locked: { label: "লকড", variant: "destructive" },
    suspended: { label: "স্থগিত", variant: "outline" },
  };
  const m = map[status] ?? { label: status, variant: "outline" };
  return <Badge variant={m.variant}>{m.label}</Badge>;
}
