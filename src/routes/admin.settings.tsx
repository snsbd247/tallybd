import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getGatewaySettings, saveBkashSettings, saveSmsSettings, saveSmsTemplate, sendTestSms } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/settings")({ component: SettingsPage });

function SettingsPage() {
  const qc = useQueryClient();
  const getFn = useServerFn(getGatewaySettings);
  const bkashFn = useServerFn(saveBkashSettings);
  const smsFn = useServerFn(saveSmsSettings);
  const tplFn = useServerFn(saveSmsTemplate);
  const { data } = useQuery({ queryKey: ["gateway-settings"], queryFn: () => getFn() });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">সেটিংস</h1>
      <p className="text-sm text-muted-foreground">পেমেন্ট ও SMS গেটওয়ে ব্যবস্থাপনা</p>
      <Tabs defaultValue="bkash" className="mt-6">
        <TabsList>
          <TabsTrigger value="bkash">bKash পেমেন্ট</TabsTrigger>
          <TabsTrigger value="sms">Greenweb SMS</TabsTrigger>
          <TabsTrigger value="templates">SMS টেমপ্লেট</TabsTrigger>
        </TabsList>

        <TabsContent value="bkash">
          {data && <BkashForm initial={data.bkash} onSave={async (v) => {
            await bkashFn({ data: v }); toast.success("সেভ হয়েছে"); qc.invalidateQueries({ queryKey: ["gateway-settings"] });
          }} />}
        </TabsContent>
        <TabsContent value="sms">
          {data && <SmsForm initial={data.sms} onSave={async (v) => {
            await smsFn({ data: v }); toast.success("সেভ হয়েছে"); qc.invalidateQueries({ queryKey: ["gateway-settings"] });
          }} />}
        </TabsContent>
        <TabsContent value="templates">
          <div className="space-y-4">
            {data?.templates?.map((t: any) => (
              <TemplateCard key={t.id} tpl={t} onSave={async (v) => {
                await tplFn({ data: v }); toast.success("টেমপ্লেট সেভ"); qc.invalidateQueries({ queryKey: ["gateway-settings"] });
              }} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BkashForm({ initial, onSave }: { initial: any; onSave: (v: any) => Promise<void> }) {
  const [f, setF] = useState({
    mode: initial?.mode ?? "sandbox",
    app_key: initial?.app_key ?? "",
    app_secret: initial?.app_secret ?? "",
    username: initial?.username ?? "",
    password: initial?.password ?? "",
    merchant_number: initial?.merchant_number ?? "",
    is_active: initial?.is_active ?? false,
  });
  useEffect(() => setF({
    mode: initial?.mode ?? "sandbox", app_key: initial?.app_key ?? "", app_secret: initial?.app_secret ?? "",
    username: initial?.username ?? "", password: initial?.password ?? "",
    merchant_number: initial?.merchant_number ?? "", is_active: initial?.is_active ?? false,
  }), [initial]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="mt-4 max-w-xl space-y-3 rounded-xl border bg-card p-6">
      <div><Label>মোড</Label>
        <Select value={f.mode} onValueChange={(v) => setF({ ...f, mode: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="sandbox">Sandbox (টেস্ট)</SelectItem><SelectItem value="live">Live</SelectItem></SelectContent>
        </Select>
      </div>
      <div><Label>App Key</Label><Input value={f.app_key} onChange={(e) => setF({ ...f, app_key: e.target.value })} /></div>
      <div><Label>App Secret</Label><Input type="password" value={f.app_secret} onChange={(e) => setF({ ...f, app_secret: e.target.value })} /></div>
      <div><Label>Username</Label><Input value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} /></div>
      <div><Label>Password</Label><Input type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></div>
      <div><Label>Merchant Number</Label><Input value={f.merchant_number} onChange={(e) => setF({ ...f, merchant_number: e.target.value })} /></div>
      <div className="flex items-center gap-2"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /><Label>একটিভ</Label></div>
      <Button type="submit">সেভ</Button>
    </form>
  );
}

function SmsForm({ initial, onSave }: { initial: any; onSave: (v: any) => Promise<void> }) {
  const [f, setF] = useState({
    api_token: initial?.api_token ?? "", sender_id: initial?.sender_id ?? "", is_active: initial?.is_active ?? false,
  });
  useEffect(() => setF({
    api_token: initial?.api_token ?? "", sender_id: initial?.sender_id ?? "", is_active: initial?.is_active ?? false,
  }), [initial]);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="mt-4 max-w-xl space-y-3 rounded-xl border bg-card p-6">
      <div><Label>API Token</Label><Input value={f.api_token} onChange={(e) => setF({ ...f, api_token: e.target.value })} /></div>
      <div><Label>Sender ID</Label><Input value={f.sender_id} onChange={(e) => setF({ ...f, sender_id: e.target.value })} /></div>
      <div className="flex items-center gap-2"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /><Label>একটিভ</Label></div>
      <Button type="submit">সেভ</Button>
    </form>
  );
}

function TemplateCard({ tpl, onSave }: { tpl: any; onSave: (v: any) => Promise<void> }) {
  const [f, setF] = useState({ id: tpl.id, title: tpl.title, body: tpl.body, is_active: tpl.is_active });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(f); }} className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <code className="text-xs text-muted-foreground">{tpl.code}</code>
        <div className="flex items-center gap-2"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /><span className="text-xs">একটিভ</span></div>
      </div>
      <Input className="mb-2" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} />
      <Textarea rows={2} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} />
      <div className="mt-2 flex justify-end"><Button size="sm" type="submit">সেভ</Button></div>
    </form>
  );
}
