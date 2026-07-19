import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSmsLogs } from "@/lib/admin.functions";
import { AdminShell } from "@/components/admin-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/sms-logs")({ component: Page });

function Page() {
  const fn = useServerFn(listSmsLogs);
  const q = useQuery({ queryKey: ["sms-logs"], queryFn: () => fn({ data: { limit: 200 } }) });

  return (
    <AdminShell>
      <div className="p-4 sm:p-6">
        <h1 className="text-xl font-bold sm:text-2xl">SMS লগ</h1>
        <p className="text-sm text-muted-foreground">সাম্প্রতিক ২০০টি SMS প্রেরণের ইতিহাস</p>
        <div className="mt-4 space-y-2">
          {q.data?.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">কোন লগ নেই</Card>}
          {q.data?.map((l: any) => (
            <Card key={l.id} className="p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm">
                    <span className="font-mono">{l.recipient}</span>
                    {l.shop?.name && <span className="text-xs text-muted-foreground">• {l.shop.name}</span>}
                    {l.template_code && <span className="rounded bg-muted px-1.5 py-0.5 text-xs">{l.template_code}</span>}
                  </div>
                  <div className="mt-1 truncate text-sm">{l.message}</div>
                  {l.response && <div className="mt-1 truncate text-xs text-muted-foreground">← {l.response}</div>}
                </div>
                <div className="text-right">
                  <Badge variant={l.status === "sent" ? "default" : l.status === "failed" ? "destructive" : "secondary"}>
                    {l.status}
                  </Badge>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {new Date(l.created_at).toLocaleString("bn-BD")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
