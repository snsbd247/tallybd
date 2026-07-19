import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSale } from "@/lib/sales.functions";
import { getMyShop } from "@/lib/shop.functions";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, FileDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/app/sales/$saleId")({ component: InvoicePage });

const fmt = (n: number) => `৳${Number(n || 0).toLocaleString("bn-BD", { maximumFractionDigits: 2 })}`;
const typeLabel: Record<string, string> = { cash: "নগদ", due: "বাকি", installment: "কিস্তি" };

function InvoicePage() {
  const { saleId } = useParams({ from: "/app/sales/$saleId" });
  const nav = useNavigate();
  const saleFn = useServerFn(getSale);
  const shopFn = useServerFn(getMyShop);

  const q = useQuery({ queryKey: ["sale", saleId], queryFn: () => saleFn({ data: { id: saleId } }) });
  const shopQ = useQuery({ queryKey: ["my-shop"], queryFn: () => shopFn() });

  const sale = q.data?.sale;
  const items = q.data?.items ?? [];
  const installments = q.data?.installments ?? [];
  const shop = shopQ.data?.shop;

  const downloadPdf = () => {
    if (!sale) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    doc.setFontSize(16);
    doc.text(shop?.name ?? "Invoice", 40, 40);
    doc.setFontSize(10);
    doc.setTextColor(120);
    if (shop?.address) doc.text(shop.address, 40, 56);
    if (shop?.phone) doc.text(`Phone: ${shop.phone}`, 40, 70);
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Invoice: ${sale.invoice_no ?? sale.id.slice(0, 8)}`, 40, 100);
    doc.text(`Date: ${sale.sale_date}`, 40, 116);
    doc.text(`Customer: ${sale.customer?.name ?? "Walk-in"}`, 300, 100);
    doc.text(`Type: ${typeLabel[sale.sale_type] ?? sale.sale_type}`, 300, 116);

    autoTable(doc, {
      startY: 140,
      head: [["#", "Item", "Qty", "Price", "Discount", "Total"]],
      body: items.map((it: any, i: number) => [
        i + 1,
        it.product?.name ?? "-",
        `${it.quantity} ${it.product?.unit?.short_name ?? ""}`,
        Number(it.unit_price).toFixed(2),
        Number(it.discount || 0).toFixed(2),
        Number(it.line_total).toFixed(2),
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [30, 41, 59] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 20;
    doc.setFontSize(11);
    doc.text(`Subtotal: ${Number(sale.subtotal).toFixed(2)}`, 380, finalY);
    doc.text(`Discount: ${Number(sale.discount).toFixed(2)}`, 380, finalY + 16);
    doc.setFontSize(13);
    doc.text(`Total: ${Number(sale.total).toFixed(2)}`, 380, finalY + 36);
    doc.setFontSize(11);
    doc.text(`Paid: ${Number(sale.paid).toFixed(2)}`, 380, finalY + 54);
    doc.text(`Due: ${Number(sale.due).toFixed(2)}`, 380, finalY + 70);

    doc.save(`invoice-${sale.invoice_no ?? sale.id.slice(0, 8)}.pdf`);
  };

  if (q.isLoading) return <div className="p-4 text-muted-foreground sm:p-6">লোড হচ্ছে...</div>;
  if (!sale) return <div className="p-4 sm:p-6">ইনভয়েস পাওয়া যায়নি</div>;

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 grid grid-cols-[auto_auto] items-center justify-between gap-2 print:hidden">
        <Button variant="ghost" size="sm" onClick={() => nav({ to: "/app/sales" })}>
          <ArrowLeft className="mr-2 h-4 w-4" /> ফিরে যান
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadPdf}><FileDown className="mr-2 h-4 w-4" /> PDF</Button>
          <Button size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" /> প্রিন্ট</Button>
        </div>
      </div>

      <div id="invoice-print" className="mx-auto max-w-3xl overflow-x-auto rounded-xl border bg-card p-4 shadow-sm print:border-0 print:p-8 print:shadow-none sm:p-8">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 border-b pb-4">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold sm:text-2xl">{shop?.name}</h1>
            {shop?.address && <p className="text-sm text-muted-foreground">{shop.address}</p>}
            {shop?.phone && <p className="text-sm text-muted-foreground">ফোন: {shop.phone}</p>}
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">ইনভয়েস</div>
            <div className="text-sm">{sale.invoice_no ?? sale.id.slice(0, 8)}</div>
            <div className="text-sm text-muted-foreground">{new Date(sale.sale_date).toLocaleDateString("bn-BD")}</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <div className="text-xs uppercase text-muted-foreground">কাস্টমার</div>
            <div className="font-semibold">{sale.customer?.name ?? "Walk-in"}</div>
            {sale.customer?.phone && <div className="text-xs">{sale.customer.phone}</div>}
            {sale.customer?.address && <div className="text-xs text-muted-foreground">{sale.customer.address}</div>}
          </div>
          <div className="text-right">
            <div className="text-xs uppercase text-muted-foreground">ধরন</div>
            <div className="font-semibold">{typeLabel[sale.sale_type] ?? sale.sale_type}</div>
            {sale.payment_method && <div className="text-xs">{sale.payment_method}</div>}
          </div>
        </div>

        <table className="mt-6 w-full min-w-[640px] text-sm">
          <thead className="border-b bg-muted/50 text-left">
            <tr>
              <th className="p-2">#</th>
              <th className="p-2">পণ্য</th>
              <th className="p-2 text-right">পরিমাণ</th>
              <th className="p-2 text-right">মূল্য</th>
              <th className="p-2 text-right">ছাড়</th>
              <th className="p-2 text-right">মোট</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it: any, i: number) => (
              <tr key={it.id} className="border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{it.product?.name ?? "-"}</td>
                <td className="p-2 text-right">{it.quantity} {it.product?.unit?.short_name ?? ""}</td>
                <td className="p-2 text-right">{fmt(it.unit_price)}</td>
                <td className="p-2 text-right">{fmt(it.discount || 0)}</td>
                <td className="p-2 text-right">{fmt(it.line_total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <div className="w-64 space-y-1 text-sm">
            <Row label="সাব-টোটাল" value={fmt(sale.subtotal)} />
            <Row label="ছাড়" value={`- ${fmt(sale.discount)}`} />
            <div className="border-t" />
            <Row label="মোট" value={fmt(sale.total)} bold />
            <Row label="পরিশোধ" value={fmt(sale.paid)} />
            <Row label="বাকি" value={fmt(sale.due)} bold />
          </div>
        </div>

        {installments.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 font-semibold">কিস্তি সূচি</h3>
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-muted/50 text-left"><tr>
                <th className="p-2">#</th><th className="p-2">তারিখ</th>
                <th className="p-2 text-right">পরিমাণ</th><th className="p-2 text-right">পরিশোধ</th><th className="p-2">অবস্থা</th>
              </tr></thead>
              <tbody>
                {installments.map((ins: any) => (
                  <tr key={ins.id} className="border-t">
                    <td className="p-2">{ins.installment_no}</td>
                    <td className="p-2">{ins.due_date}</td>
                    <td className="p-2 text-right">{fmt(ins.amount)}</td>
                    <td className="p-2 text-right">{fmt(ins.paid_amount || 0)}</td>
                    <td className="p-2 capitalize">{ins.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 flex justify-between border-t pt-6 text-xs text-muted-foreground">
          <div>ধন্যবাদ, আবার আসবেন।</div>
          <div>স্বাক্ষর: __________________</div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          aside, .print\\:hidden { display: none !important; }
          #invoice-print { box-shadow: none; border: none; max-width: 100%; }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "font-bold" : ""}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
