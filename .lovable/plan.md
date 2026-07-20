## Scope

দশটি আইটেম আছে — কিছু ছোট বাগফিক্স, কিছু নতুন ফিচার। নিচে ফেজ ভাগ করে দিচ্ছি যাতে পর্যায়ক্রমে ডেলিভার করতে পারি।

## Phase A — Quick fixes (ছোট, দ্রুত)

1. **সুপার এডমিন লগিন রিডাইরেক্ট ফিক্স** — `admin.login.tsx` এ লগিন সফল হলে `/admin` এ push করবে, role check এর জন্য `useAuth` স্টেট আপডেটের অপেক্ষা করবে (বর্তমানে সম্ভবত `/` তে যাচ্ছে)।
2. **দোকান লিস্টে ৩-ডট ড্রপডাউন মেনু** — `admin.shops.index.tsx` এ inline বাটনগুলো shadcn `DropdownMenu` দিয়ে রিপ্লেস করব (View / Edit / Impersonate / Delete)।
7. **লগিন পেজ মর্ডান ডিজাইন** — `login.tsx` ও `admin.login.tsx` এ gradient background, glass card, ব্র্যান্ডিং লোগো, split layout।
10. **সার্চেবল সিলেক্ট** — Product/Customer/Supplier সিলেক্ট গুলো shadcn `Command`+`Popover` (combobox) দিয়ে রিপ্লেস। POS (`app.sales.new`, `app.purchases.new`), stock adjust, customer payment — সব জায়গায়।

## Phase B — English POS receipts (একই টেমপ্লেট, ৩ জায়গায় ব্যবহার)

3+4+5. একটি English POS-style invoice/receipt কম্পোনেন্ট বানাব (80mm, `window.print()`, existing receipt-config reuse)। এটা ব্যবহার হবে:
- Shop detail → Subscription history ট্যাব → "Download Invoice" বাটন
- Shop detail → Payments ট্যাব → "Download Receipt" বাটন
- `admin.subscriptions.tsx` (Subscription payments পেজ) → row-এ "Receipt" বাটন

সব text ইংরেজি — বর্তমান বাংলা রিসিপ্ট থেকে আলাদা রুট (`/admin/receipts/en/$paymentId`, `/admin/invoices/en/$subscriptionId`)।

## Phase C — Admin user management

6. **সুপার এডমিন ইউজার ম্যানেজমেন্ট** — নতুন রুট `admin.users.tsx`:
- ইমেইল+পাসওয়ার্ড দিয়ে নতুন সুপার এডমিন তৈরি (`supabaseAdmin.auth.admin.createUser` + `user_roles` insert)
- বর্তমান super_admin দের লিস্ট, রোল রিভোক
- Server function `createSuperAdmin`, `listSuperAdmins`, `revokeSuperAdmin` — self-revoke ব্লক, শেষ super_admin ব্লক।

## Phase D — Rich shop dashboard

8. **শপ ড্যাশবোর্ড ইনফরমেটিভ** — `app.index.tsx`:
- আজকের বিক্রয়/ক্রয়/লাভ, cash/due/bkash breakdown
- মোট বকেয়া (কাস্টমার/সাপ্লায়ার), overdue installments count
- Low stock alerts (top 5)
- Recent sales/purchases (5টি)
- ৭ দিনের বিক্রয় mini chart (recharts)
- সাবস্ক্রিপশন expiry countdown
- Quick action tiles

নতুন aggregate server function `getShopDashboard`।

## Phase E — Product stock movement view

9. **পণ্যের সম্পূর্ণ স্টক মুভমেন্ট পেজ** — নতুন রুট `app.products.$productId.tsx`:
- Header: current stock, purchase/sale price, total in/out/adjust
- Timeline table: date, type (purchase/sale/adjustment/return), quantity ±, reference (invoice link), note
- Row click / "ডিটেইল" button `app.products.tsx` থেকে navigate
- Server function `getProductMovements(product_id)`।

## Delivery order

আমি এক টার্নে সব ঠেলবো না — টার্ন-১ এ Phase A + B (bug/UX fixes, receipts) দিচ্ছি, তারপর টার্ন-২ এ C+D+E। এটাই সেফ, রিভিউ সহজ।

**আপনি কনফার্ম করলে Phase A + B দিয়ে শুরু করছি।** অন্য কোনো order চাইলে বলুন (যেমন "সবই একসাথে দিন" — সেক্ষেত্রে বড় ডিফ হবে)।
