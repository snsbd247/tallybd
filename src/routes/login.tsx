import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({ component: ShopLogin });

function ShopLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, primaryShopId, isSuperAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (session && primaryShopId) navigate({ to: "/app" });
    else if (session && isSuperAdmin) navigate({ to: "/admin" });
  }, [session, primaryShopId, isSuperAdmin, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("সফল লগিন");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Store className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Supershop</span>
        </Link>
        <div className="rounded-xl border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-bold">দোকানদার লগিন</h1>
          <p className="mt-1 text-sm text-muted-foreground">আপনার দোকানের একাউন্টে লগিন করুন।</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label>ইমেইল</Label>
              <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>পাসওয়ার্ড</Label>
              <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "লগিন হচ্ছে..." : "লগিন"}
            </Button>
          </form>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            একাউন্ট নেই? সুপার এডমিনকে যোগাযোগ করুন।
          </p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/admin/login" className="text-xs text-muted-foreground hover:underline">
            সুপার এডমিন লগিন
          </Link>
        </div>
      </div>
    </div>
  );
}
