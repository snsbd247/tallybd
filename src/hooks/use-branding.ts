import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { getBranding } from "@/lib/admin.functions";

export type Branding = {
  site_name?: string | null;
  tagline?: string | null;
  logo_url?: string | null;
  favicon_url?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  contact_address?: string | null;
  facebook_url?: string | null;
  website_url?: string | null;
  footer_note?: string | null;
};

export function useBranding() {
  const fn = useServerFn(getBranding);
  const q = useQuery<Branding | null>({
    queryKey: ["branding"],
    queryFn: () => fn() as any,
    staleTime: 5 * 60 * 1000,
  });
  const brand = q.data ?? null;
  return {
    brand,
    siteName: brand?.site_name || "Supershop",
    tagline: brand?.tagline || "",
    logoUrl: brand?.logo_url || "",
    faviconUrl: brand?.favicon_url || "",
    footerNote: brand?.footer_note || "",
  };
}

/** Applies favicon + document title from branding. Renders nothing. */
export function BrandingEffect() {
  const { siteName, faviconUrl } = useBranding();
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = faviconUrl;
    }
    if (siteName && !document.title.includes(siteName)) {
      // keep page-specific title; just ensure site name is in it
      document.title = document.title ? `${document.title} — ${siteName}` : siteName;
    }
  }, [faviconUrl, siteName]);
  return null;
}
