import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyShop = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: roleRow } = await context.supabase
      .from("user_roles")
      .select("shop_id, role")
      .eq("user_id", context.userId)
      .not("shop_id", "is", null)
      .limit(1)
      .maybeSingle();
    if (!roleRow?.shop_id) return { shop: null, role: null };

    const { data: shop } = await context.supabase
      .from("shops")
      .select("*, package:packages(*)")
      .eq("id", roleRow.shop_id)
      .single();

    // Auto-check expiry
    if (shop && shop.subscription_end && new Date(shop.subscription_end) < new Date()
        && shop.status === "active") {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("shops").update({ status: "expired" }).eq("id", shop.id);
      shop.status = "expired";
    }

    return { shop, role: roleRow.role };
  });
