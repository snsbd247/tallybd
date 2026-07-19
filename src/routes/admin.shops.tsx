import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listShops, createShop, updateShopStatus, extendShopSubscription, listPackages } from "@/lib/admin.functions";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Lock, Unlock, CalendarPlus } from "lucide-react";

export const Route = createFileRoute("/admin/shops")({ component: ShopsPage });

function ShopsPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listShops);
  const pkgsFn = useServerFn(listPackages);
  const createFn = useServerFn(createShop);
  const statusFn = useServerFn(updateShopStatus);
  const extendFn = useServerFn(extendShopSubscription);

  const shops = useQuery({ queryKey: ["shops"], queryFn: () => listFn() });
  const pkgs = useQuery({ queryKey: ["packages"], queryFn: () => pkgsFn() });

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "", owner_name: "", phone: "", email: "", address: "",
    package_id: "", billing_cycle: "monthly" as "monthly" | "yearly",
    password: Math.random().toString(36).slice(-8),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["shops"] });

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createFn({ data: form });
      toast.success(`দোকান তৈরি হয়েছে। পাসওয়ার্ড: ${res.credentials.password}`, { duration: 10000 });
      setOpen(false);
      invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ব্যর্থ");
    }
  };

  const toggleLock = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "locked" ? "active" : "locked";
    await statusFn({ data: { shop_id: id, status: newStatus as any } });
    invalidate();
    toast.success("আপডেট হয়েছে");
  };

  const extend = async (id: string) => {
    await extendFn({ data: { shop_id: id, months: 1 } });
    invalidate();
    toast.success("১ মাস বাড়ানো হয়েছে");
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">দোকান সমূহ</h1>
          <p className="text-sm text-muted-foreground">সব রেজিস্ট্রেড দোকান</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> নতুন দোকান</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>নতুন দোকান তৈরি</DialogTitle></DialogHeader>
            <form onSubmit={onCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>দোকানের নাম</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div><Label>মালিকের নাম</Label><Input required value={form.owner_name} onChange={(e) => setForm({ ...form, owner_name: e.target.value })} /></div>
                <div><Label>ফোন</Label><Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                <div><Label>ইমেইল (লগিন)</Label><Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              </div>
              <div><Label>ঠিকানা</Label><Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>প্যাকেজ</Label>
                  <Select value={form.package_id} onValueChange={(v) => setForm({ ...form, package_id: v })}>
                    <SelectTrigger><SelectValue placeholder="বাছাই করুন" /></SelectTrigger>
                    <SelectContent>
                      {pkgs.data?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>{p.name} — ৳{p.price_monthly}/mo</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>বিলিং</Label>
                  <Select value={form.billing_cycle} onValueChange={(v) => setForm({ ...form, billing_cycle: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">মাসিক</SelectItem>
                      <SelectItem value="yearly">বাৎসরিক</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div><Label>পাসওয়ার্ড</Label><Input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
              <DialogFooter><Button type="submit">তৈরি করুন</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3">দোকান</th>
              <th className="px-4 py-3">মালিক</th>
              <th className="px-4 py-3">প্যাকেজ</th>
              <th className="px-4 py-3">স্ট্যাটাস</th>
              <th className="px-4 py-3">মেয়াদ শেষ</th>
              <th className="px-4 py-3 text-right">অ্যাকশন</th>
            </tr>
          </thead>
          <tbody>
            {shops.data?.map((s: any) => (
              <tr key={s.id} className="border-t">
                <td className="px-4 py-3 font-medium">{s.name}</td>
                <td className="px-4 py-3">{s.owner_name}<br /><span className="text-xs text-muted-foreground">{s.phone}</span></td>
                <td className="px-4 py-3">{s.package?.name ?? "-"}</td>
                <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                <td className="px-4 py-3">{s.subscription_end ? new Date(s.subscription_end).toLocaleDateString("bn-BD") : "-"}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="ghost" onClick={() => extend(s.id)}><CalendarPlus className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleLock(s.id, s.status)}>
                      {s.status === "locked" ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {shops.data?.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">কোনো দোকান নেই</td></tr>
            )}
          </tbody>
        </table>
      </div>
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
