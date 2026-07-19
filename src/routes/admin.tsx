import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AdminShell } from "@/components/admin-shell";

export const Route = createFileRoute("/admin")({
  ssr: false,
  component: AdminLayout,
});

function AdminLayout() {
  const { loading, session, isSuperAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/admin/login" });
    else if (!isSuperAdmin) navigate({ to: "/" });
  }, [loading, session, isSuperAdmin, navigate]);

  if (loading || !session || !isSuperAdmin) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">লোড হচ্ছে...</div>;
  }

  return (
    <AdminShell>
      <Outlet />
    </AdminShell>
  );
}
