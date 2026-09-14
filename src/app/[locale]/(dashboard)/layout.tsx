import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

/**
 * Guards every route under (dashboard) -- parent, teacher, student, admin,
 * classroom -- behind a real login. Before this file existed, none of
 * these routes checked who (if anyone) was signed in: they were reachable
 * directly by URL with no session at all, and every page independently
 * hardcoded a single demo account's id regardless of who was asking.
 *
 * This layout only confirms *someone* is logged in. Role-specific checks
 * (e.g. "must be a parent") and resolving the real profile row for that
 * person still happen per-page via src/lib/auth/currentUser.ts, since
 * each dashboard area needs a different role.
 */
export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getSession();

  if (!session) {
    redirect(`/${locale}/login`);
  }

  return <>{children}</>;
}
