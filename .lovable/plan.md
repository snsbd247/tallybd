
# Supershop — SaaS Grocery Store Management System

একটি মাল্টি-টেন্যান্ট SaaS যেখানে সুপার এডমিন দোকান একাউন্ট তৈরি করে সাবস্ক্রিপশন বিক্রি করবে, এবং প্রতিটি দোকানদার নিজের দোকানের ক্রয়-বিক্রয়, স্টক, কাস্টমার/সাপ্লায়ার লেজার ম্যানেজ করবে।

## 1. Tech Stack
- Frontend: TanStack Start (React 19) + Tailwind + shadcn/ui
- Backend: Lovable Cloud (Postgres + Auth + Server Functions)
- Payment: bKash Tokenized Checkout (subscription) + manual cash/bKash (customer payments)
- SMS: Greenweb SMS API
- Language: UI দুই ভাষায় (বাংলা primary, English secondary toggle)

## 2. User Roles & Auth
- **Super Admin** — আলাদা লগিন পেজ `/admin/login`
- **Shop Owner / Staff** — আলাদা লগিন পেজ `/login`
  - Role types per shop: `owner`, `manager`, `cashier`
- Roles আলাদা `user_roles` টেবিলে (security definer function সহ)
- একাউন্ট তৈরি হলে auto-generated password SMS এ যাবে

## 3. Super Admin Panel (`/admin/*`)
### Dashboard
- Total shops, active/expired/locked counts, MRR, আজকের রেভিনিউ, SMS ব্যালেন্স

### Shop Management
- নতুন দোকান একাউন্ট তৈরি (নাম, মালিকের নাম, ফোন, ঠিকানা, প্যাকেজ, মেয়াদ)
- একাউন্ট তৈরি হলে → login credentials SMS এ পাঠানো
- Shop list: search, filter (active/expired/locked), edit, suspend, extend, delete

### Package Management
- Package CRUD: নাম, price (monthly/yearly), features (max products, max users, max SMS/month), duration
- Multiple packages (Basic, Standard, Premium ইত্যাদি)

### Subscription Management
- সব দোকানের subscription history
- Manual renewal, package upgrade/downgrade
- Payment logs (bKash transaction IDs)

### Payment Gateway Settings
- bKash: App Key, App Secret, Username, Password, Merchant Number, Sandbox/Live toggle
- সব encrypted হয়ে DB তে সেভ

### SMS Gateway Settings
- Greenweb: API token, sender ID, test send button
- SMS templates edit (account created, expiry warning, expired, renewed, upgraded)
- SMS logs (sent/failed, cost tracking)

### Reports
- Revenue report (monthly/yearly)
- Package-wise sales
- SMS usage report

## 4. Subscription Lifecycle & Lock Flow
- প্রতিটি shop এ `subscription_end_date`
- Cron/scheduled function (pg_cron + server route) প্রতিদিন চেক করবে:
  - **7 দিন আগে** — expiry warning SMS
  - **1 দিন আগে** — final warning SMS
  - **মেয়াদ শেষ** — status `locked` + SMS
- Locked shop এ লগিন করলে → শুধু `/renew` পেজ দেখাবে (payment screen)
- bKash পেমেন্ট success → status `active`, নতুন end_date সেট, renewal SMS
- Package upgrade → prorated calculation + upgrade SMS

## 5. Shop Owner Panel (`/app/*`)
### Dashboard
- আজকের বিক্রি, নগদ/বাকি/কিস্তি breakdown
- স্টকে কম আছে (low stock alerts)
- বকেয়া কাস্টমার top list
- মাসিক profit summary

### Product & Stock Management
- Category, Unit (কেজি, পিস, লিটার ইত্যাদি), Product CRUD
- Product: নাম, SKU/barcode, purchase price, sale price, current stock, reorder level
- Stock adjustment (damage, correction) with reason log
- Low stock alerts

### Purchase (ক্রয়)
- Supplier থেকে ক্রয় entry: products, quantity, price, total, paid/due
- Purchase return
- Auto stock increase + supplier ledger update

### Supplier Management
- Supplier CRUD (নাম, ফোন, ঠিকানা, opening balance)
- Supplier ledger (সব ক্রয়, payment, বকেয়া balance)
- Supplier কে পেমেন্ট entry (নগদ/বিকাশ)

### Sales (বিক্রয়) — POS Screen
- Fast POS: barcode/search → cart → discount → total
- Three sale types:
  - **নগদ বিক্রি** — immediate cash
  - **বাকি বিক্রি** — customer selected, added to due
  - **কিস্তি বিক্রি** — installment plan (# of installments, per-installment amount, due dates)
- Payment method: Cash / bKash (manual entry with transaction ID)
- Invoice print (thermal printer friendly) + SMS to customer

### Customer Management
- Customer CRUD (নাম, ফোন, ঠিকানা, opening balance)
- Customer ledger (সব বিক্রি, payment, due)
- বকেয়া list with total due
- Installment tracker (upcoming/overdue installments)
- Payment receive (cash/bKash) → auto ledger update + SMS receipt

### Reports
- **Daily/Monthly/Yearly**: Purchase, Sale, Cash sale, Due sale, Installment sale
- Profit report (sale - cost)
- Product-wise sale
- Customer-wise due
- Supplier-wise payable
- Stock valuation report
- Cash book (nagad in/out)
- বিকাশ book (bKash in/out)
- Export: PDF / Excel

### Settings
- Shop info, logo, invoice header/footer
- User management (staff add with role)
- SMS notification toggle (bill sent, payment received)

## 6. Database Schema (high level)
```
super_admins, packages, shops, subscriptions, subscription_payments
payment_gateway_settings, sms_gateway_settings, sms_templates, sms_logs
user_roles (shop_id, user_id, role)
shop_settings, categories, units, products, stock_movements
suppliers, purchases, purchase_items, supplier_payments
customers, sales, sale_items, sale_payments, installments
cash_transactions
```
All shop-scoped tables: `shop_id` + RLS policy filtering by user's shop membership.

## 7. Security
- Roles in separate `user_roles` table with `has_role()` security definer
- RLS: প্রতিটি shop এর data শুধু সেই shop এর user রা দেখবে
- Super admin bypass via separate role check
- bKash credentials encrypted at rest
- Locked shop middleware — সব route এ subscription status check

## 8. bKash Integration
- Tokenized Checkout API (subscription payment)
- Server function: create payment → get bKash URL → redirect → callback → execute → verify → activate subscription
- Webhook route `/api/public/bkash/callback` with signature verification
- Manual bKash entry for customer payments (just transaction ID logging, no API call)

## 9. Greenweb SMS Integration
- Server function `sendSMS(phone, message)` — called from all triggers
- Template variables: `{shop_name}`, `{owner}`, `{password}`, `{package}`, `{end_date}`, `{amount}`
- Retry on failure, log every attempt

## 10. Build Phases
1. **Phase 1** — Cloud enable, DB schema, Super Admin auth + basic shop CRUD
2. **Phase 2** — Package management, Subscription lifecycle, Shop owner auth + lock screen
3. **Phase 3** — Greenweb SMS integration + templates + super admin settings
4. **Phase 4** — bKash integration + subscription payment flow
5. **Phase 5** — Product, Category, Stock management (shop panel)
6. **Phase 6** — Supplier + Purchase module + ledger
7. **Phase 7** — Customer + Sales (POS) — cash/due/installment
8. **Phase 8** — Payment receive + Customer ledger + installment tracker
9. **Phase 9** — All reports (daily/monthly/yearly, cash book, bKash book, profit)
10. **Phase 10** — Dashboard polish, invoice print, PDF/Excel export, notifications

## Questions Before Starting
1. **bKash Merchant type** — আপনার কি bKash Merchant Account আছে? (Tokenized Checkout API access দরকার — সাধারণ personal bKash এ হবে না)
2. **Greenweb account** — Greenweb SMS এর API token রেডি আছে?
3. **Language** — UI বাংলা primary নাকি bilingual toggle?
4. **Start point** — আমি কি Phase 1 দিয়ে শুরু করব, নাকি অন্য কোনো phase আগে চান?

## Notes
- এটি বড় project — ১০ phase এ ভাগ করে ধাপে ধাপে build হবে
- প্রতিটি phase শেষে test করে পরের phase এ যাব
- bKash ও Greenweb এর real API test করতে credentials লাগবে (Phase 3 ও 4 এ)
