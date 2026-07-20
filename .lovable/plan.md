## লক্ষ্য
সুপার এডমিন যেকোনো শপে "Login as Shop" বাটন দিয়ে নতুন ট্যাবে সরাসরি সেই শপের প্যানেলে ঢুকতে পারবে — মূল ট্যাবে সুপার এডমিন সেশন অক্ষত থাকবে।

## চ্যালেঞ্জ
Supabase auth session `localStorage`-এ থাকে এবং একই origin-এ সব ট্যাব একই সেশন শেয়ার করে। তাই সরাসরি নতুন ট্যাবে অন্য user হিসেবে `signIn` করলে মূল ট্যাবের সুপার এডমিন সেশনও ওভাররাইট হয়ে যাবে। এটা এড়াতে আলাদা storage scope দরকার।

## সমাধান — সংক্ষেপে
1. এক-বার-ব্যবহারযোগ্য **impersonation token** ইস্যু করা হবে সার্ভার থেকে (super admin ভেরিফাই করে)।
2. নতুন ট্যাব খুলবে `/impersonate?token=...` রুটে।
3. সেই রুট একটা **আলাদা Supabase client instance** ব্যবহার করবে যার `storageKey` আলাদা (যেমন `sb-impersonation-auth`) — এতে ডিফল্ট সুপার এডমিন সেশনের সাথে সংঘর্ষ হবে না।
4. token রিডিম করে সেই শপ ইউজারের session তৈরি হবে এবং ইম্পার্সোনেটেড ইউজার হিসেবে shop panel-এ redirect হবে।

## প্রযুক্তিগত বিস্তারিত

### ডাটাবেস
নতুন টেবিল `public.impersonation_tokens`:
- `id uuid pk`, `token text unique`, `admin_id uuid`, `target_user_id uuid`, `shop_id uuid`
- `expires_at timestamptz` (৬০ সেকেন্ড)
- `consumed_at timestamptz`
- RLS: শুধু service_role access; সব read/write server function দিয়ে

### Server functions (`src/lib/impersonation.functions.ts`)
- `createImpersonationToken({ shopId })` — `requireSupabaseAuth` + super admin role চেক → শপের owner user খুঁজে → random token তৈরি করে insert → token রিটার্ন
- `redeemImpersonationToken({ token })` — token ভ্যালিডেট, expired/consumed চেক, `supabaseAdmin.auth.admin.generateLink({ type: 'magiclink' })` দিয়ে target user-এর জন্য session tokens তৈরি → `access_token` + `refresh_token` রিটার্ন করবে → `consumed_at` সেট

### ক্লায়েন্ট
- `src/integrations/supabase/impersonation-client.ts` — আলাদা `storageKey: 'sb-impersonation-auth'` সহ নতুন `createClient` instance
- নতুন রুট `src/routes/impersonate.tsx` (public, ssr:false):
  - URL থেকে token পড়ে → `redeemImpersonationToken` কল → পাওয়া tokens দিয়ে impersonation client-এ `setSession()` → `/shop` এ navigate
  - এই ট্যাবের সব shop panel code impersonation client ব্যবহার করবে (context provider দিয়ে সুইচ)
- Shop panel সম্পূর্ণ ভিন্ন origin না হওয়ায়, ট্যাব-স্কোপড সেশন রাখার জন্য `impersonation-client` এ `storage: sessionStorage` ব্যবহার করা হবে — এতে নতুন ট্যাব বন্ধ করলে সেশন শেষ, এবং মূল ট্যাবের `localStorage`-এর super admin সেশনে কোনো প্রভাব নেই

### UI
- `src/routes/admin.shops.$shopId.tsx` এবং শপ লিস্টে "Login as Shop" বাটন
- ক্লিক → `createImpersonationToken` → `window.open('/impersonate?token=...', '_blank')`
- সব ইম্পার্সোনেশন `sms_logs`-এর মতো একটা `impersonation_audit` টেবিলে log হবে (কে, কখন, কোন শপ)

### সিকিউরিটি
- Token: 32-byte random, one-time use, 60s expiry
- শুধু super admin (`has_role(uid, 'super_admin')`) create করতে পারবে
- Shop panel-এ impersonation active হলে ছোট banner: "🔴 Impersonating {shop_name} — Close tab to exit"
- Audit log সুপার এডমিন সেটিংসে দেখা যাবে

## ফাইল পরিবর্তন
- **নতুন migration**: `impersonation_tokens`, `impersonation_audit` টেবিল + GRANTs + RLS
- **নতুন**: `src/lib/impersonation.functions.ts`, `src/integrations/supabase/impersonation-client.ts`, `src/routes/impersonate.tsx`, `ImpersonationBanner` কম্পোনেন্ট
- **এডিট**: `src/routes/admin.shops.index.tsx` ও `admin.shops.$shopId.tsx` (বাটন), শপ প্যানেল shell (banner + client switching)

অনুমতি দিলে ইমপ্লিমেন্ট শুরু করব।