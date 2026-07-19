import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/admin/login")({ component: AdminLogin });

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { session, isSuperAdmin, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && session && isSuperAdmin) navigate({ to: "/admin" });
  }, [session, isSuperAdmin, authLoading, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) toast.error(error.message);
    else toast.success("সফল লগিন");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold">Supershop Admin</span>
        </div>
        <div className="rounded-xl border bg-card p-8 shadow-lg">
          <h1 className="text-2xl font-bold">সুপার এডমিন লগিন</h1>
          <p className="mt-1 text-sm text-muted-foreground">শুধুমাত্র অনুমোদিত এডমিনদের জন্য।</p>
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
          <div className="mt-4 flex justify-between text-xs">
            <Link to="/admin/setup" className="text-muted-foreground hover:underline">
              প্রথম সেটাপ
            </Link>
            <Link to="/" className="text-muted-foreground hover:underline">
              হোম
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
