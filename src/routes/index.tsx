import { createFileRoute, Link } from "@tanstack/react-router";
import { Store, ShieldCheck, Package, CreditCard, MessageSquare, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/hooks/use-branding";


export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </div>
            <span className="truncate text-lg font-bold sm:text-xl">Supershop</span>
          </div>
          <nav className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">লগিন</Button>
            </Link>
            <Link to="/admin/login">
              <Button variant="outline" size="sm" className="px-2 sm:px-3">
                <ShieldCheck className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">সুপার এডমিন</span>
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            মুদি দোকানের সম্পূর্ণ ম্যানেজমেন্ট সফটওয়্যার
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            POS, স্টক, ক্রয়-বিক্রয়, বকেয়া, কিস্তি, কাস্টমার ও সাপ্লায়ার লেজার — সবকিছু এক জায়গায়।
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login">
              <Button size="lg">দোকানে লগিন করুন</Button>
            </Link>
          </div>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Package, title: "স্টক ম্যানেজমেন্ট", desc: "প্রোডাক্ট, ক্যাটাগরি, ইউনিট, ব্যারকোড, লো-স্টক অ্যালার্ট" },
            { icon: CreditCard, title: "নগদ / বাকি / কিস্তি", desc: "সব ধরনের বিক্রি ও অটোমেটিক লেজার আপডেট" },
            { icon: BarChart3, title: "সম্পূর্ণ রিপোর্ট", desc: "দৈনিক, মাসিক, বাৎসরিক ও প্রোডাক্ট-ওয়াইজ রিপোর্ট" },
            { icon: MessageSquare, title: "SMS নোটিফিকেশন", desc: "কাস্টমারকে বিল ও পেমেন্ট রিসিভের ম্যাসেজ" },
            { icon: Store, title: "মাল্টি-স্টাফ", desc: "মালিক, ম্যানেজার, ক্যাশিয়ার - আলাদা রোল" },
            { icon: ShieldCheck, title: "সুরক্ষিত ডেটা", desc: "প্রতিটি দোকানের ডেটা আলাদা ও এনক্রিপ্টেড" },
          ].map((f) => (
            <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Supershop
      </footer>
    </div>
  );
}
