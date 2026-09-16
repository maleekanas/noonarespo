import type { Metadata } from "next";
import "@/app/globals.css";
import { getDirection, locales, getDictionary } from "@/lib/localization";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { RoleSwitcher } from "@/components/shared/RoleSwitcher";
import { SentryInit } from "@/components/monitoring/SentryInit";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dict = getDictionary(locale);

  return {
    title: `${dict.common.siteName} | ${dict.common.siteTagline}`,
    description: dict.footer.platformDescription || dict.common.siteTagline,
    manifest: "/manifest.json",
    icons: {
      icon: "/icon.svg",
      apple: "/icon.svg",
    },
  };
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        <SentryInit />
        <Header locale={locale} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
        <RoleSwitcher />
      </body>
    </html>
  );
}
