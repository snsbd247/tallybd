import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertSuperAdmin(context: { supabase: any; userId: string }) {
  const { data, error } = await context.supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", context.userId)
    .eq("role", "super_admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: super admin only");
}

// ---------- Stats ----------
export const getAdminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [total, active, expired, locked, packages, sms] = await Promise.all([
      supabaseAdmin.from("shops").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("shops").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabaseAdmin.from("shops").select("id", { count: "exact", head: true }).eq("status", "expired"),
      supabaseAdmin.from("shops").select("id", { count: "exact", head: true }).eq("status", "locked"),
      supabaseAdmin.from("packages").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("sms_logs").select("id", { count: "exact", head: true }),
    ]);
    return {
      totalShops: total.count ?? 0,
      activeShops: active.count ?? 0,
      expiredShops: expired.count ?? 0,
      lockedShops: locked.count ?? 0,
      totalPackages: packages.count ?? 0,
      smsSent: sms.count ?? 0,
    };
  });

// ---------- Shops ----------
export const listShops = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("shops")
      .select("*, package:packages(name)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const createShopSchema = z.object({
  name: z.string().min(1),
  owner_name: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  address: z.string().optional(),
  package_id: z.string().uuid(),
  billing_cycle: z.enum(["monthly", "yearly"]),
  password: z.string().min(6),
});

export const createShop = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createShopSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1) Create auth user
    const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.owner_name, phone: data.phone },
    });
    if (userErr || !userData.user) throw new Error(userErr?.message ?? "User create failed");

    // 2) Compute subscription end
    const start = new Date();
    const end = new Date(start);
    if (data.billing_cycle === "monthly") end.setMonth(end.getMonth() + 1);
    else end.setFullYear(end.getFullYear() + 1);

    // 3) Get package price
    const { data: pkg } = await supabaseAdmin
      .from("packages").select("*").eq("id", data.package_id).single();
    const amount = data.billing_cycle === "monthly" ? pkg?.price_monthly : pkg?.price_yearly;

    // 4) Create shop
    const { data: shop, error: shopErr } = await supabaseAdmin
      .from("shops")
      .insert({
        name: data.name,
        owner_name: data.owner_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        package_id: data.package_id,
        billing_cycle: data.billing_cycle,
        status: "active",
        subscription_start: start.toISOString(),
        subscription_end: end.toISOString(),
        created_by: context.userId,
      })
      .select()
      .single();
    if (shopErr) throw new Error(shopErr.message);

    // 5) Assign shop_owner role
    await supabaseAdmin.from("user_roles").insert({
      user_id: userData.user.id,
      role: "shop_owner",
      shop_id: shop.id,
    });

    // 6) Log subscription
    await supabaseAdmin.from("subscriptions").insert({
      shop_id: shop.id,
      package_id: data.package_id,
      billing_cycle: data.billing_cycle,
      amount: amount ?? 0,
      status: "active",
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
    });

    // 7) TODO: send SMS (Phase 3)

    return { shop, credentials: { email: data.email, password: data.password } };
  });

export const updateShopStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      shop_id: z.string().uuid(),
      status: z.enum(["active", "expired", "locked", "suspended"]),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("shops").update({ status: data.status }).eq("id", data.shop_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const extendShopSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ shop_id: z.string().uuid(), months: z.number().int().min(1).max(24) }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: shop } = await supabaseAdmin
      .from("shops").select("subscription_end").eq("id", data.shop_id).single();
    const base = shop?.subscription_end ? new Date(shop.subscription_end) : new Date();
    if (base < new Date()) base.setTime(Date.now());
    base.setMonth(base.getMonth() + data.months);
    const { error } = await supabaseAdmin
      .from("shops")
      .update({ status: "active", subscription_end: base.toISOString() })
      .eq("id", data.shop_id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Packages ----------
export const listPackages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("packages").select("*").order("sort_order");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

const pkgSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  price_monthly: z.number().min(0),
  price_yearly: z.number().min(0),
  max_products: z.number().int().min(0),
  max_users: z.number().int().min(1),
  max_sms_per_month: z.number().int().min(0),
  is_active: z.boolean(),
  sort_order: z.number().int().min(0),
});

export const savePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => pkgSchema.parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const payload = { ...data };
    if (data.id) {
      const { error } = await supabaseAdmin.from("packages").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("packages").insert(payload);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const deletePackage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("packages").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

// ---------- Gateway Settings ----------
export const getGatewaySettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [bkash, sms, templates] = await Promise.all([
      supabaseAdmin.from("payment_gateway_settings").select("*").eq("provider", "bkash").maybeSingle(),
      supabaseAdmin.from("sms_gateway_settings").select("*").eq("provider", "greenweb").maybeSingle(),
      supabaseAdmin.from("sms_templates").select("*").order("code"),
    ]);
    return { bkash: bkash.data, sms: sms.data, templates: templates.data ?? [] };
  });

export const saveBkashSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      mode: z.enum(["sandbox", "live"]),
      app_key: z.string().optional(),
      app_secret: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      merchant_number: z.string().optional(),
      is_active: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("payment_gateway_settings")
      .update(data)
      .eq("provider", "bkash");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSmsSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({
      api_token: z.string().optional(),
      sender_id: z.string().optional(),
      is_active: z.boolean(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("sms_gateway_settings").update(data).eq("provider", "greenweb");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const saveSmsTemplate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), title: z.string(), body: z.string(), is_active: z.boolean() }).parse(d),
  )
  .handler(async ({ data, context }) => {
    await assertSuperAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("sms_templates")
      .update({ title: data.title, body: data.body, is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
