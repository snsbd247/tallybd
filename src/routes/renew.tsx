import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyShop } from "@/lib/shop.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Lock, LogOut, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/renew")({ ssr: false, component: RenewPage });

function RenewPage() {
  const navigate = useNavigate();
  const { loading, session } = useAuth();
  const fn = useServerFn(getMyShop);
  const { data } = useQuery({ queryKey: ["my-shop"], queryFn: () => fn(), enabled: !!session });

  useEffect(() => {
    if (!loading && !session) navigate({ to: "/login" });
  }, [loading, session, navigate]);

  const shop = data?.shop;
  const signOut = async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); };

  if (shop && shop.status === "active") {
    navigate({ to: "/app" });
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <Lock className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-4 text-center text-2xl font-bold">একাউন্ট লকড</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {shop?.name} — আপনার সাবস্ক্রিপশনের মেয়াদ শেষ হয়েছে। বিকাশ পেমেন্ট করে রিনিউ করুন।
        </p>

        <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-sm">
          <div className="flex justify-between"><span>প্যাকেজ:</span><span className="font-medium">{shop?.package?.name}</span></div>
          <div className="mt-1 flex justify-between"><span>বিলিং:</span><span className="font-medium">{shop?.billing_cycle === "monthly" ? "মাসিক" : "বাৎসরিক"}</span></div>
          <div className="mt-1 flex justify-between">
            <span>পরিমাণ:</span>
            <span className="font-bold">
              ৳{shop?.billing_cycle === "monthly" ? shop?.package?.price_monthly : shop?.package?.price_yearly}
            </span>
          </div>
        </div>

        <Button className="mt-6 w-full" size="lg" onClick={() => toast.info("bKash ইন্টিগ্রেশন Phase 4-এ আসবে")}>
          <CreditCard className="mr-2 h-5 w-5" /> bKash এ পেমেন্ট করুন
        </Button>

        <Button variant="ghost" className="mt-2 w-full" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> লগআউট
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          সমস্যায় আছেন? সুপার এডমিনকে যোগাযোগ করুন।
        </p>
      </div>
    </div>
  );
}
