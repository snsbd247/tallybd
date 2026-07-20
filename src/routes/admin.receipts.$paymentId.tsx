import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getPaymentReceipt } from "@/lib/admin.functions";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

export const Route = createFileRoute("/admin/receipts/$paymentId")({ component: ReceiptPage });

function ReceiptPage() {
  const { paymentId } = useParams({ from: "/admin/receipts/$paymentId" });
  const fn = useServerFn(getPaymentReceipt);
  const { data, isLoading } = useQuery({
    queryKey: ["receipt", paymentId],
    queryFn: () => fn({ data: { payment_id: paymentId } }),
  });

  useEffect(() => {
    if (data) setTimeout(() => window.print(), 400);
  }, [data]);

  if (isLoading || !data) return <div className="p-6 text-sm text-muted-foreground">লোড হচ্ছে...</div>;
  const p: any = (data as any).payment;
  const brand: any = (data as any).brand ?? {};

  const line = "--------------------------------";
  const row = (k: string, v: string) => (
    <div className="flex justify-between gap-2">
      <span>{k}</span><span className="text-right">{v}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/40 py-6 print:bg-white print:py-0">
      <div className="mx-auto mb-3 flex max-w-[302px] justify-end gap-2 print:hidden">
        <Button size="sm" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> প্রিন্ট</Button>
      </div>
      <div id="pos-receipt" className="mx-auto bg-white p-3 font-mono text-[12px] leading-tight text-black shadow-sm print:shadow-none">
        <div className="text-center">
          <div className="text-[15px] font-bold uppercase">{brand.site_name ?? "Supershop"}</div>
          {brand.tagline && <div className="text-[11px]">{brand.tagline}</div>}
          {brand.contact_phone && <div>ফোন: {brand.contact_phone}</div>}
          {brand.contact_email && <div>{brand.contact_email}</div>}
          {brand.contact_address && <div className="text-[11px]">{brand.contact_address}</div>}
        </div>
        <div className="my-1 text-center">{line}</div>
        <div className="text-center font-bold">PAYMENT RECEIPT</div>
        <div className="my-1 text-center">{line}</div>

        {row("Receipt#", p.id.slice(0, 8).toUpperCase())}
        {row("Date", new Date(p.paid_at ?? p.created_at).toLocaleString("en-GB"))}
        {row("Method", p.method ?? "bKash")}
        {row("TrxID", p.transaction_id ?? "-")}
        {row("Status", (p.status ?? "").toUpperCase())}

        <div className="my-1 text-center">{line}</div>
        <div className="font-bold">Shop</div>
        {row("Name", p.shop?.name ?? "-")}
        {row("Owner", p.shop?.owner_name ?? "-")}
        {row("Phone", p.shop?.phone ?? "-")}

        <div className="my-1 text-center">{line}</div>
        <div className="font-bold">Package</div>
        {row("Plan", p.subscription?.package?.name ?? p.shop?.package?.name ?? "-")}
        {row("Billing", p.subscription?.billing_cycle ?? "-")}

        <div className="my-1 text-center">{line}</div>
        <div className="flex justify-between text-[14px] font-bold">
          <span>TOTAL</span>
          <span>BDT {Number(p.amount).toLocaleString("en-US")}</span>
        </div>
        <div className="my-1 text-center">{line}</div>

        <div className="mt-2 text-center text-[11px]">
          {brand.footer_note ?? "Thank you for your payment."}
        </div>
        <div className="mt-1 text-center text-[10px]">
          Printed: {new Date().toLocaleString("en-GB")}
        </div>
      </div>

      <style>{`
        @page { size: 80mm auto; margin: 0; }
        @media print {
          html, body { background: white !important; margin: 0; padding: 0; }
          #pos-receipt { width: 80mm; box-shadow: none; padding: 4mm 3mm; }
        }
        #pos-receipt { width: 302px; }
      `}</style>
    </div>
  );
}
