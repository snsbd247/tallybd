import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getShopDetail, updateShop, deleteShop, listPackages, updateShopStatus,
  extendShopSubscription, upgradeShopPackage, resetShopUserPassword, removeShopUser,
} from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { ArrowLeft, Pencil, Trash2, Lock, Unlock, CalendarPlus, ArrowUpCircle, KeyRound, UserX } from "lucide-react";

export const Route = createFileRoute("/admin/shops/$shopId")({ component: ShopDetail });

const bdt = (n: number | string) => `৳${Number(n || 0).toLocaleString("bn-BD")}`;

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
  const upgradeFn = useServerFn(upgradeShopPackage);
  const resetPwFn = useServerFn(resetShopUserPassword);
  const removeUserFn = useServerFn(removeShopUser);

  const q = useQuery({ queryKey: ["shop-detail", shopId], queryFn: () => getFn({ data: { shop_id: shopId } }) });
  const pkgs = useQuery({ queryKey: ["packages"], queryFn: () => pkgsFn() });

  const [editOpen, setEditOpen] = useState(false);
  const [delOpen, setDelOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [pwOpen, setPwOpen] = useState<{ user_id: string; email?: string } | null>(null);
  const [form, setForm] = useState<any>(null);
  const [upgradeForm, setUpgradeForm] = useState({ package_id: "", billing_cycle: "monthly" as "monthly" | "yearly", months: 1 });
  const [newPw, setNewPw] = useState("");

  const shop = q.data?.shop;
  const t = q.data?.totals;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["shop-detail", shopId] });

  const openEdit = () => {
    if (!shop) return;
    setForm({
      shop_id: shop.id, name: shop.name, owner_name: shop.owner_name, phone: shop.phone,
      email: shop.email, address: shop.address ?? "",
      package_id: shop.package_id, billing_cycle: shop.billing_cycle ?? "monthly",
    });
    setEditOpen(true);
  };
  const openUpgrade = () => {
    if (!shop) return;
    setUpgradeForm({ package_id: shop.package_id ?? "", billing_cycle: (shop.billing_cycle ?? "monthly") as any, months: 1 });
    setUpgradeOpen(true);
  };

  const saveMut = useMutation({ mutationFn: () => updateFn({ data: form }),
    onSuccess: () => { toast.success("আপডেট হয়েছে"); invalidate(); setEditOpen(false); },
    onError: (e: any) => toast.error(e.message) });

  const upgradeMut = useMutation({ mutationFn: () => upgradeFn({ data: { shop_id: shopId, ...upgradeForm } }),
    onSuccess: () => { toast.success("প্যাকেজ আপডেট হয়েছে"); invalidate(); setUpgradeOpen(false); },
    onError: (e: any) => toast.error(e.message) });

  const delMut = useMutation({ mutationFn: () => deleteFn({ data: { shop_id: shopId } }),
    onSuccess: () => { toast.success("দোকান ডিলিট হয়েছে"); navigate({ to: "/admin/shops" }); },
    onError: (e: any) => toast.error(e.message) });

  const resetPwMut = useMutation({
    mutationFn: () => resetPwFn({ data: { user_id: pwOpen!.user_id, password: newPw } }),
    onSuccess: () => { toast.success("পাসওয়ার্ড আপডেট হয়েছে"); setPwOpen(null); setNewPw(""); },
    onError: (e: any) => toast.error(e.message),
  });

  if (q.isLoading) return <AdminShell><div className="p-6">লোড হচ্ছে...</div></AdminShell>;
  if (q.error) return <AdminShell><div className="p-6 text-destructive">{(q.error as Error).message}</div></AdminShell>;
  if (!shop) return <AdminShell><div className="p-6">দোকান পাওয়া যায়নি</div></AdminShell>;

  const activeSub = q.data?.subscriptions?.find((s: any) => s.status === "active");

  return (
    <AdminShell>
      <div className="p-4 sm:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button asChild variant="ghost" size="icon"><Link to="/admin/shops"><ArrowLeft className="h-4 w-4" /></Link></Button>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-bold sm:text-2xl">{shop.name}</h1>
              <p className="text-sm text-muted-foreground">{shop.owner_name} • {shop.phone} • <StatusBadge status={shop.status} /></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => extendFn({ data: { shop_id: shopId, months: 1 } }).then(() => { toast.success("১ মাস বাড়ানো হলো"); invalidate(); })}>
              <CalendarPlus className="mr-1 h-4 w-4" /> ১ মাস
            </Button>
            <Button size="sm" variant="outline" onClick={openUpgrade}><ArrowUpCircle className="mr-1 h-4 w-4" />আপগ্রেড</Button>
            <Button size="sm" variant="outline" onClick={() => statusFn({ data: { shop_id: shopId, status: shop.status === "locked" ? "active" : "locked" } }).then(() => { toast.success("আপডেট"); invalidate(); })}>
              {shop.status === "locked" ? <><Unlock className="mr-1 h-4 w-4" />আনলক</> : <><Lock className="mr-1 h-4 w-4" />লক</>}
            </Button>
            <Button size="sm" onClick={openEdit}><Pencil className="mr-1 h-4 w-4" />ইডিট</Button>
            <Button size="sm" variant="destructive" onClick={() => setDelOpen(true)}><Trash2 className="mr-1 h-4 w-4" />ডিলিট</Button>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="মোট বিক্রয়" value={bdt(t?.totalSales ?? 0)} tone="bg-emerald-500/10 text-emerald-700" />
          <StatCard label="মোট ক্রয়" value={bdt(t?.totalPurchases ?? 0)} tone="bg-sky-500/10 text-sky-700" />
          <StatCard label="মোট বাকি (কাস্টমার)" value={bdt(t?.totalDue ?? 0)} tone="bg-amber-500/10 text-amber-700" />
          <StatCard label="সাপ্লায়ারকে পরিশোধ" value={bdt(t?.totalPaidToSuppliers ?? 0)} tone="bg-fuchsia-500/10 text-fuchsia-700" />
          <StatCard label="মোট নগদ গ্রহণ" value={bdt(t?.cashIn ?? 0)} tone="bg-green-500/10 text-green-700" />
          <StatCard label="মোট বিকাশ গ্রহণ" value={bdt(t?.bkashIn ?? 0)} tone="bg-pink-500/10 text-pink-700" />
          <StatCard label="নগদ পরিশোধ" value={bdt(t?.cashOut ?? 0)} tone="bg-slate-500/10 text-slate-700" />
          <StatCard label="বিকাশ পরিশোধ" value={bdt(t?.bkashOut ?? 0)} tone="bg-rose-500/10 text-rose-700" />
        </div>

        {/* Active package summary */}
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase text-muted-foreground">সক্রিয় প্যাকেজ</div>
              <div className="text-lg font-semibold">{shop.package?.name ?? "—"} <span className="text-sm text-muted-foreground">({shop.billing_cycle === "yearly" ? "বাৎসরিক" : "মাসিক"})</span></div>
              <div className="text-sm text-muted-foreground">
                মেয়াদ শেষ: {shop.subscription_end ? new Date(shop.subscription_end).toLocaleDateString("bn-BD") : "—"}
                {activeSub && <> • সাবস্ক্রিপশন: {bdt(activeSub.amount)}</>}
              </div>
            </div>
            <Button size="sm" onClick={openUpgrade}><ArrowUpCircle className="mr-1 h-4 w-4" />প্যাকেজ পরিবর্তন</Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="customers" className="w-full">
          <TabsList className="flex flex-wrap">
            <TabsTrigger value="customers">কাস্টমার ({t?.customersCount ?? 0})</TabsTrigger>
            <TabsTrigger value="suppliers">সাপ্লায়ার ({t?.suppliersCount ?? 0})</TabsTrigger>
            <TabsTrigger value="products">প্রোডাক্ট স্টক ({t?.productsCount ?? 0})</TabsTrigger>
            <TabsTrigger value="subs">সাবস্ক্রিপশন হিস্ট্রি</TabsTrigger>
            <TabsTrigger value="payments">পেমেন্ট</TabsTrigger>
            <TabsTrigger value="users">ইউজার ({q.data?.users?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="customers">
            <TableCard headers={["নাম", "ফোন", "বর্তমান বাকি"]} rows={(q.data?.customers ?? []).map((c: any) => [c.name, c.phone ?? "-", bdt(c.current_balance)])} empty="কোন কাস্টমার নেই" />
          </TabsContent>
          <TabsContent value="suppliers">
            <TableCard headers={["নাম", "ফোন", "বর্তমান বাকি"]} rows={(q.data?.suppliers ?? []).map((s: any) => [s.name, s.phone ?? "-", bdt(s.current_balance)])} empty="কোন সাপ্লায়ার নেই" />
          </TabsContent>
          <TabsContent value="products">
            <TableCard
              headers={["নাম", "SKU", "স্টক", "ক্রয়মূল্য", "বিক্রয়মূল্য"]}
              rows={(q.data?.products ?? []).map((p: any) => [
                p.name, p.sku ?? "-",
                <span className={Number(p.stock_quantity) <= Number(p.low_stock_alert || 0) ? "text-destructive font-semibold" : ""}>{Number(p.stock_quantity)} {p.unit?.name ?? ""}</span>,
                bdt(p.purchase_price), bdt(p.sale_price),
              ])}
              empty="কোন প্রোডাক্ট নেই"
            />
          </TabsContent>
          <TabsContent value="subs">
            <Card className="p-4">
              <div className="space-y-2 text-sm">
                {q.data?.subscriptions?.length === 0 && <p className="text-muted-foreground">কোন সাবস্ক্রিপশন নেই</p>}
                {q.data?.subscriptions?.map((s: any) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded border p-3">
                    <div>
                      <div className="font-medium">{s.package?.name} <span className="text-xs text-muted-foreground">({s.billing_cycle === "yearly" ? "বাৎসরিক" : "মাসিক"})</span></div>
                      <div className="text-xs text-muted-foreground">{new Date(s.starts_at).toLocaleDateString("bn-BD")} → {new Date(s.ends_at).toLocaleDateString("bn-BD")}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{bdt(s.amount)}</span>
                      <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="payments">
            <TableCard
              headers={["তারিখ", "TrxID", "মেথড", "এমাউন্ট", "স্ট্যাটাস"]}
              rows={(q.data?.payments ?? []).map((p: any) => [
                new Date(p.created_at).toLocaleDateString("bn-BD"),
                <span className="font-mono text-xs">{p.transaction_id ?? "-"}</span>,
                p.payment_method ?? "-",
                bdt(p.amount),
                <Badge variant={p.status === "success" ? "default" : p.status === "pending" ? "secondary" : "destructive"}>{p.status}</Badge>,
              ])}
              empty="কোন পেমেন্ট নেই"
            />
          </TabsContent>
          <TabsContent value="users">
            <Card className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead className="bg-muted/50 text-left"><tr>
                  <th className="p-3">ইমেইল</th><th className="p-3">রোল</th><th className="p-3">তৈরি</th><th className="p-3 text-right">অ্যাকশন</th>
                </tr></thead>
                <tbody>
                  {q.data?.users?.length === 0 && (<tr><td colSpan={4} className="p-6 text-center text-muted-foreground">কোন ইউজার নেই</td></tr>)}
                  {q.data?.users?.map((u: any) => (
                    <tr key={u.id} className="border-t">
                      <td className="p-3">{u.email ?? "-"}</td>
                      <td className="p-3"><Badge variant="outline">{u.role}</Badge></td>
                      <td className="p-3 text-xs text-muted-foreground">{u.created_at ? new Date(u.created_at).toLocaleDateString("bn-BD") : "-"}</td>
                      <td className="p-3">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setPwOpen({ user_id: u.user_id, email: u.email }); setNewPw(Math.random().toString(36).slice(-8)); }}>
                            <KeyRound className="mr-1 h-3 w-3" />পাসওয়ার্ড
                          </Button>
                          {u.role !== "shop_owner" && (
                            <Button size="sm" variant="ghost" onClick={async () => { await removeUserFn({ data: { user_id: u.user_id, shop_id: shopId } }); toast.success("রিমুভ"); invalidate(); }}>
                              <UserX className="h-3 w-3 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </TabsContent>
        </Tabs>
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
                <div><Label>প্যাকেজ</Label>
                  <Select value={form.package_id ?? ""} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{pkgs.data?.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label>বিলিং</Label>
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

      {/* Upgrade dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>প্যাকেজ আপগ্রেড / পরিবর্তন</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); upgradeMut.mutate(); }} className="space-y-3">
            <div><Label>প্যাকেজ</Label>
              <Select value={upgradeForm.package_id} onValueChange={(v) => setUpgradeForm({ ...upgradeForm, package_id: v })}>
                <SelectTrigger><SelectValue placeholder="বাছাই করুন" /></SelectTrigger>
                <SelectContent>
                  {pkgs.data?.map((p: any) => (<SelectItem key={p.id} value={p.id}>{p.name} — ৳{p.price_monthly}/mo</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>বিলিং</Label>
                <Select value={upgradeForm.billing_cycle} onValueChange={(v) => setUpgradeForm({ ...upgradeForm, billing_cycle: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="monthly">মাসিক</SelectItem><SelectItem value="yearly">বাৎসরিক</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>মেয়াদ (মাস)</Label>
                <Input type="number" min={1} value={upgradeForm.months} onChange={(e) => setUpgradeForm({ ...upgradeForm, months: parseInt(e.target.value || "1") })} />
              </div>
            </div>
            <DialogFooter><Button type="submit" disabled={upgradeMut.isPending || !upgradeForm.package_id}>কনফার্ম</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password reset dialog */}
      <Dialog open={!!pwOpen} onOpenChange={(o) => !o && setPwOpen(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>পাসওয়ার্ড পরিবর্তন</DialogTitle></DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); resetPwMut.mutate(); }} className="space-y-3">
            <div className="text-sm text-muted-foreground">{pwOpen?.email}</div>
            <div><Label>নতুন পাসওয়ার্ড</Label><Input required minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)} /></div>
            <DialogFooter><Button type="submit" disabled={resetPwMut.isPending}>সেভ করুন</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <AlertDialog open={delOpen} onOpenChange={setDelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>দোকান ডিলিট করবেন?</AlertDialogTitle>
            <AlertDialogDescription>এই কাজটি বাতিল করা যাবে না। দোকানের সব ডাটা (পণ্য, বিক্রি, ক্রয়) এবং মালিকের একাউন্ট মুছে যাবে।</AlertDialogDescription>
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

function StatCard({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 inline-block rounded px-2 py-0.5 text-xs ${tone}`}>{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </Card>
  );
}

function TableCard({ headers, rows, empty }: { headers: string[]; rows: any[][]; empty: string }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[500px] text-sm">
        <thead className="bg-muted/50 text-left"><tr>{headers.map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
        <tbody>
          {rows.length === 0 && (<tr><td colSpan={headers.length} className="p-6 text-center text-muted-foreground">{empty}</td></tr>)}
          {rows.map((r, i) => (
            <tr key={i} className="border-t">{r.map((c, j) => <td key={j} className="p-3">{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </Card>
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
