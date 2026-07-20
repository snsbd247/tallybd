import { useEffect, useState } from "react";
import { ShieldAlert, X } from "lucide-react";

export function ImpersonationBanner() {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    setActive(window.sessionStorage.getItem("__lovable_impersonating") === "1");
  }, []);
  if (!active) return null;
  return (
    <div className="flex items-center justify-between gap-3 bg-gradient-to-r from-rose-600 to-orange-500 px-4 py-2 text-white shadow-md">
      <div className="flex min-w-0 items-center gap-2 text-sm">
        <ShieldAlert className="h-4 w-4 shrink-0" />
        <span className="truncate font-medium">
          সুপার এডমিন হিসেবে ইম্পার্সোনেট করছেন — এই ট্যাব বন্ধ করলে সেশন শেষ হবে।
        </span>
      </div>
      <button
        onClick={() => window.close()}
        className="flex shrink-0 items-center gap-1 rounded-md bg-white/20 px-2 py-1 text-xs font-medium hover:bg-white/30"
      >
        <X className="h-3 w-3" /> বন্ধ
      </button>
    </div>
  );
}
