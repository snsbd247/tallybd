import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { Package, Users, TrendingUp, Wallet } from "lucide-react";

export const Route = createFileRoute("/app/")({ component: ShopDashboard });

function ShopDashboard() {
  const fn = useServerFn(getMyShop);
  const { data } = useQuery({ queryKey: ["my-shop"], queryFn: () => fn() });
  const shop = data?.shop;

  const end = shop?.subscription_end ? new Date(shop.subscription_end) : null;
  const daysLeft = end ? Math.ceil((end.getTime() - Date.now()) / (24 * 3600 * 1000)) : 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">স্বাগতম, {shop?.owner_name}</h1>
      <p className="text-sm text-muted-foreground">{shop?.name}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="প্যাকেজ" value={shop?.package?.name ?? "-"} icon={Package} />
        <StatCard label="বিলিং" value={shop?.billing_cycle === "monthly" ? "মাসিক" : "বাৎসরিক"} icon={Wallet} />
        <StatCard label="মেয়াদ শেষ" value={end ? end.toLocaleDateString("bn-BD") : "-"} icon={TrendingUp} />
        <StatCard label="বাকি দিন" value={`${daysLeft} দিন`} icon={Users} />
      </div>

      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">পরবর্তী ধাপে যা আসবে</h2>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>প্রোডাক্ট, ক্যাটাগরি, ইউনিট ম্যানেজমেন্ট</li>
          <li>POS বিক্রি স্ক্রিন (নগদ / বাকি / কিস্তি)</li>
          <li>ক্রয়, সাপ্লায়ার লেজার</li>
          <li>কাস্টমার লেজার ও পেমেন্ট রিসিভ</li>
          <li>সম্পূর্ণ রিপোর্ট (দৈনিক, মাসিক, বাৎসরিক)</li>
        </ul>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-xl font-bold">{value}</p>
        </div>
        <Icon className="h-6 w-6 text-primary" />
      </div>
    </div>
  );
}
