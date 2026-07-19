import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPackages, savePackage, deletePackage } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/packages")({ component: PackagesPage });

const empty = {
  id: undefined as string | undefined,
  name: "",
  description: "",
  price_monthly: 0,
  price_yearly: 0,
  max_products: 100,
  max_users: 1,
  max_sms_per_month: 100,
  is_active: true,
  sort_order: 0,
};

function PackagesPage() {
  const qc = useQueryClient();
  const listFn = useServerFn(listPackages);
  const saveFn = useServerFn(savePackage);
  const delFn = useServerFn(deletePackage);
  const { data } = useQuery({ queryKey: ["packages"], queryFn: () => listFn() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<typeof empty>(empty);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["packages"] });

  const openEdit = (p: any) => { setForm({ ...p }); setOpen(true); };
  const openNew = () => { setForm(empty); setOpen(true); };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveFn({ data: form });
      toast.success("সেভ হয়েছে"); setOpen(false); invalidate();
    } catch (err) { toast.error(err instanceof Error ? err.message : "ব্যর্থ"); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("ডিলিট করবেন?")) return;
    try { await delFn({ data: { id } }); invalidate(); toast.success("ডিলিট হয়েছে"); }
    catch (err) { toast.error(err instanceof Error ? err.message : "ব্যর্থ"); }
  };

  return (
    <AdminShell>
      <div className="p-4 sm:p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold sm:text-2xl">প্যাকেজ ম্যানেজমেন্ট</h1>
          <p className="text-sm text-muted-foreground">সাবস্ক্রিপশন প্যাকেজ তৈরি ও ব্যবস্থাপনা</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="shrink-0" onClick={openNew}><Plus className="mr-2 h-4 w-4" /> নতুন প্যাকেজ</Button></DialogTrigger>
          <DialogContent className="max-h-[92dvh] max-w-lg overflow-y-auto">
            <DialogHeader><DialogTitle>{form.id ? "প্যাকেজ এডিট" : "নতুন প্যাকেজ"}</DialogTitle></DialogHeader>
            <form onSubmit={onSave} className="space-y-3">
              <div><Label>নাম</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><Label>বিবরণ</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>মাসিক মূল্য (৳)</Label><Input type="number" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: +e.target.value })} /></div>
                <div><Label>বাৎসরিক মূল্য (৳)</Label><Input type="number" value={form.price_yearly} onChange={(e) => setForm({ ...form, price_yearly: +e.target.value })} /></div>
                <div><Label>ম্যাক্স প্রোডাক্ট</Label><Input type="number" value={form.max_products} onChange={(e) => setForm({ ...form, max_products: +e.target.value })} /></div>
                <div><Label>ম্যাক্স ইউজার</Label><Input type="number" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: +e.target.value })} /></div>
                <div><Label>SMS/মাস</Label><Input type="number" value={form.max_sms_per_month} onChange={(e) => setForm({ ...form, max_sms_per_month: +e.target.value })} /></div>
                <div><Label>সর্ট অর্ডার</Label><Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: +e.target.value })} /></div>
              </div>
              <div className="flex items-center gap-2"><Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /><Label>একটিভ</Label></div>
              <DialogFooter><Button type="submit">সেভ</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((p: any) => (
          <div key={p.id} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold">{p.name}</h3>
                <p className="text-xs text-muted-foreground">{p.description}</p>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(p.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="mt-3 text-2xl font-bold">৳{p.price_monthly}<span className="text-sm font-normal text-muted-foreground">/মাস</span></div>
            <div className="text-sm text-muted-foreground">৳{p.price_yearly}/বছর</div>
            <ul className="mt-3 space-y-1 text-sm">
              <li>প্রোডাক্ট: {p.max_products}</li>
              <li>ইউজার: {p.max_users}</li>
              <li>SMS/মাস: {p.max_sms_per_month}</li>
            </ul>
          </div>
        ))}
      </div>
      </div>
    </AdminShell>
  );
}
