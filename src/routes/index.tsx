import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store,
  ShieldCheck,
  Package,
  CreditCard,
  MessageSquare,
  BarChart3,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
  Users,
  Receipt,
  TrendingUp,
  Smartphone,
  Cloud,
  Star,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/use-branding";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  const { siteName, logoUrl, tagline, footerNote } = useBranding();

  const features = [
    { icon: Package, title: "স্টক ম্যানেজমেন্ট", desc: "প্রোডাক্ট, ক্যাটাগরি, ইউনিট, ব্যারকোড, লো-স্টক অ্যালার্ট", grad: "grad-emerald", soft: "soft-emerald" },
    { icon: CreditCard, title: "নগদ / বাকি / কিস্তি", desc: "সব ধরনের বিক্রি ও অটোমেটিক লেজার আপডেট", grad: "grad-blue", soft: "soft-blue" },
    { icon: BarChart3, title: "সম্পূর্ণ রিপোর্ট", desc: "দৈনিক, মাসিক, বাৎসরিক ও প্রোডাক্ট-ওয়াইজ রিপোর্ট", grad: "grad-violet", soft: "soft-violet" },
    { icon: MessageSquare, title: "SMS নোটিফিকেশন", desc: "কাস্টমারকে বিল ও পেমেন্ট রিসিভের ম্যাসেজ", grad: "grad-sunset", soft: "soft-amber" },
    { icon: Users, title: "মাল্টি-স্টাফ", desc: "মালিক, ম্যানেজার, ক্যাশিয়ার — আলাদা রোল ও পারমিশন", grad: "grad-cyan", soft: "soft-cyan" },
    { icon: ShieldCheck, title: "সুরক্ষিত ডেটা", desc: "প্রতিটি দোকানের ডেটা আলাদা ও এনক্রিপ্টেড", grad: "grad-rose", soft: "soft-rose" },
  ];

  const stats = [
    { value: "১০০০+", label: "সক্রিয় দোকান", icon: Store },
    { value: "৫০ লাখ+", label: "ট্রান্সেকশন", icon: Receipt },
    { value: "৯৯.৯%", label: "আপটাইম", icon: Zap },
    { value: "২৪/৭", label: "সাপোর্ট", icon: ShieldCheck },
  ];

  const workflow = [
    { step: "০১", title: "সাইন আপ করুন", desc: "মিনিটেই দোকানের অ্যাকাউন্ট তৈরি করুন", icon: Sparkles },
    { step: "০২", title: "প্রোডাক্ট যোগ করুন", desc: "স্টক, সাপ্লায়ার ও কাস্টমার সেটআপ", icon: Package },
    { step: "০৩", title: "বিক্রি শুরু করুন", desc: "POS দিয়ে দ্রুত বিক্রি ও রিপোর্ট", icon: TrendingUp },
  ];

  const highlights = [
    "মাল্টি-ডিভাইস (মোবাইল, ট্যাব, ল্যাপটপ)",
    "থার্মাল প্রিন্টার সাপোর্ট (৮০mm)",
    "বিকাশ পেমেন্ট ইন্টিগ্রেশন",
    "অটো ব্যাকআপ ও ক্লাউড সিঙ্ক",
    "বাংলা ইন্টারফেস",
    "রিয়েল-টাইম ড্যাশবোর্ড",
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              <img src={logoUrl} alt={siteName} className="h-10 w-10 rounded-xl object-contain bg-white p-1 shadow-md ring-1 ring-black/5" />
            ) : (
              <div className="grad-ocean flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg shadow-blue-500/30">
                <Store className="h-5 w-5" />
              </div>
            )}
            <span className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{siteName}</span>
          </div>

          <nav className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <a href="#features" className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground md:inline-block">ফিচার</a>
            <a href="#workflow" className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground md:inline-block">কিভাবে কাজ করে</a>
            <Link to="/login">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">লগিন</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* Background mesh */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-br from-blue-400/30 via-indigo-400/20 to-transparent blur-3xl" />
            <div className="absolute -bottom-40 -left-32 h-[400px] w-[600px] rounded-full bg-gradient-to-tr from-emerald-300/30 to-transparent blur-3xl" />
            <div className="absolute -right-32 top-40 h-[400px] w-[500px] rounded-full bg-gradient-to-bl from-rose-300/30 to-transparent blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgb(148 163 184 / 0.3) 1px, transparent 1px), linear-gradient(to bottom, rgb(148 163 184 / 0.3) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse 60% 50% at 50% 40%, black 40%, transparent 100%)",
              }}
            />
          </div>

          <div className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
            <div className="mx-auto max-w-4xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
                <span className="grad-emerald inline-block h-1.5 w-1.5 rounded-full" />
                বাংলাদেশের #১ মুদি দোকান সফটওয়্যার
                <Sparkles className="h-3 w-3 text-amber-500" />
              </div>

              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
                দোকান চালান{" "}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                    স্মার্টলি
                  </span>
                  <svg className="absolute -bottom-2 left-0 w-full" height="10" viewBox="0 0 200 10" fill="none" preserveAspectRatio="none">
                    <path d="M2 8 Q100 -2 198 6" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                বাড়ান বিক্রি ও লাভ
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
                POS, স্টক, ক্রয়-বিক্রয়, বকেয়া, কিস্তি, কাস্টমার ও সাপ্লায়ার লেজার —
                সবকিছু এক জায়গায়। মোবাইল, ট্যাব বা ল্যাপটপ থেকে যেকোনো জায়গা থেকে চালান।
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link to="/login">
                  <Button size="lg" className="grad-ocean h-12 gap-2 rounded-full border-0 px-6 text-base font-semibold shadow-xl shadow-blue-500/30 hover:opacity-95">
                    এখনই শুরু করুন <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="h-12 gap-2 rounded-full border-2 px-6 text-base font-semibold">
                    ফিচার দেখুন <ChevronRight className="h-4 w-4" />
                  </Button>
                </a>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> ফ্রি ট্রায়াল</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> কার্ড লাগবে না</div>
                <div className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-600" /> ২ মিনিটে সেটআপ</div>
              </div>
            </div>

            {/* Preview mockup card */}
            <div className="relative mx-auto mt-16 max-w-5xl">
              <div className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-r from-blue-400/30 via-indigo-400/30 to-violet-400/30 opacity-70 blur-2xl" />
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl ring-1 ring-black/5">
                <div className="flex items-center gap-1.5 border-b bg-muted/40 px-4 py-2.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  <div className="ml-3 h-4 w-40 rounded bg-muted" />
                </div>
                <div className="grid gap-3 p-4 sm:grid-cols-4 sm:p-5">
                  {stats.map((s) => (
                    <div key={s.label} className="soft-blue rounded-xl border border-border/50 p-4">
                      <s.icon className="h-4 w-4 text-blue-700" />
                      <div className="mt-2 text-2xl font-black text-slate-900">{s.value}</div>
                      <div className="text-xs text-slate-700">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="grid gap-3 border-t p-4 sm:grid-cols-3 sm:p-5">
                  <div className="grad-emerald rounded-xl p-4 shadow-md">
                    <TrendingUp className="h-5 w-5" />
                    <div className="mt-2 text-xs opacity-90">আজকের বিক্রয়</div>
                    <div className="text-xl font-extrabold">৳৪২,৩৫০</div>
                  </div>
                  <div className="grad-violet rounded-xl p-4 shadow-md">
                    <Receipt className="h-5 w-5" />
                    <div className="mt-2 text-xs opacity-90">এ মাসের বিক্রয়</div>
                    <div className="text-xl font-extrabold">৳১২,৮৫,০০০</div>
                  </div>
                  <div className="grad-sunset rounded-xl p-4 shadow-md">
                    <Users className="h-5 w-5" />
                    <div className="mt-2 text-xs opacity-90">কাস্টমার</div>
                    <div className="text-xl font-extrabold">১,২৪৭</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black tracking-tight sm:text-3xl">
                  <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{s.value}</span>
                </div>
                <div className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Sparkles className="h-3 w-3" /> ফিচার সমূহ
            </div>
            <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
              যা যা দরকার, সব <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">এক প্ল্যাটফর্মে</span>
            </h2>
            <p className="mt-3 text-muted-foreground">দোকান পরিচালনার প্রতিটি ধাপ সহজ ও অটোমেটেড</p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="card-hover group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
                <div className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20 blur-2xl ${f.grad}`} />
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg ${f.grad}`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Highlights strip */}
          <div className="mt-10 rounded-2xl border bg-gradient-to-br from-slate-50 to-blue-50/50 p-6 sm:p-8">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-2.5 text-sm">
                  <div className="grad-emerald flex h-6 w-6 shrink-0 items-center justify-center rounded-full shadow-md">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-slate-800">{h}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Workflow */}
        <section id="workflow" className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
            <div className="mx-auto max-w-2xl text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                <Zap className="h-3 w-3" /> কিভাবে কাজ করে
              </div>
              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">৩ ধাপে শুরু</h2>
              <p className="mt-3 text-muted-foreground">টেকনিক্যাল জ্ঞান লাগবে না — যেকেউ পারবে</p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {workflow.map((w, i) => (
                <div key={w.step} className="relative">
                  <div className="card-hover relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="grad-ocean inline-flex h-12 w-12 items-center justify-center rounded-xl shadow-lg shadow-blue-500/30">
                        <w.icon className="h-6 w-6" />
                      </div>
                      <span className="text-4xl font-black text-muted-foreground/20">{w.step}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{w.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground">{w.desc}</p>
                  </div>
                  {i < workflow.length - 1 && (
                    <ArrowRight className="absolute -right-3 top-1/2 hidden h-6 w-6 -translate-y-1/2 text-muted-foreground/30 md:block" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust / Testimonial band */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              { name: "মোঃ রফিকুল ইসলাম", role: "মালিক, রফিক স্টোর", stars: 5, quote: "আগে হিসাব রাখতে অনেক ঝামেলা হতো। এখন সব অটোমেটিক — বকেয়া, স্টক, রিপোর্ট সব হাতের মুঠোয়।" },
              { name: "সাদিয়া আক্তার", role: "মালিক, সাদিয়া মার্ট", stars: 5, quote: "SMS দিয়ে কাস্টমারকে বিল পাঠানো যায়। বকেয়া আদায় অনেক সহজ হয়ে গেছে।" },
              { name: "কামাল হোসেন", role: "মালিক, নিউ ঢাকা স্টোর", stars: 5, quote: "মোবাইল থেকেই দোকান চালাচ্ছি। বিকাশ পেমেন্ট ইন্টিগ্রেশন সবচেয়ে ভালো ফিচার।" },
            ].map((t) => (
              <div key={t.name} className="card-hover rounded-2xl border bg-card p-6 shadow-sm">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3 border-t pt-4">
                  <div className="grad-violet flex h-10 w-10 items-center justify-center rounded-full font-bold shadow-md">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
          <div className="grad-ocean relative overflow-hidden rounded-3xl p-8 shadow-2xl shadow-blue-500/30 sm:p-14">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
              <div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                  <Sparkles className="h-3 w-3" /> আজই শুরু করুন
                </div>
                <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
                  আপনার দোকানকে ডিজিটাল করুন
                </h2>
                <p className="mt-3 max-w-xl text-white/90">
                  হাজার হাজার দোকানদার আমাদের সাথে বিক্রি বাড়াচ্ছেন। আজই যোগ দিন।
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/90">
                  <div className="flex items-center gap-1.5"><Smartphone className="h-4 w-4" /> মোবাইল ফ্রেন্ডলি</div>
                  <div className="flex items-center gap-1.5"><Cloud className="h-4 w-4" /> ক্লাউড ব্যাকআপ</div>
                  <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> সুরক্ষিত</div>
                </div>
              </div>
              <Link to="/login">
                <Button size="lg" className="h-14 gap-2 rounded-full bg-white px-8 text-base font-bold text-blue-700 shadow-xl hover:bg-white/95">
                  ফ্রি শুরু করুন <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div className="sm:col-span-2">
              <div className="flex items-center gap-2.5">
                {logoUrl ? (
                  <img src={logoUrl} alt={siteName} className="h-9 w-9 rounded-lg bg-white object-contain p-1 ring-1 ring-black/5" />
                ) : (
                  <div className="grad-ocean flex h-9 w-9 items-center justify-center rounded-lg shadow-md">
                    <Store className="h-4 w-4" />
                  </div>
                )}
                <span className="text-lg font-extrabold">{siteName}</span>
              </div>
              <p className="mt-3 max-w-md text-sm text-muted-foreground">
                {tagline || "মুদি দোকানের সম্পূর্ণ ম্যানেজমেন্ট সফটওয়্যার — POS, স্টক, বকেয়া, রিপোর্ট সবকিছু এক জায়গায়।"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-bold">প্রোডাক্ট</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground">ফিচার</a></li>
                <li><a href="#workflow" className="hover:text-foreground">কিভাবে কাজ করে</a></li>
                <li><Link to="/login" className="hover:text-foreground">লগিন</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-bold">এডমিন</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/admin/login" className="hover:text-foreground">সুপার এডমিন</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:text-left">
            <div>© {new Date().getFullYear()} {siteName}. সর্বস্বত্ব সংরক্ষিত।</div>
            {footerNote && <div>{footerNote}</div>}
          </div>
        </div>
      </footer>
    </div>
  );
}
