import { SidebarShell } from "@/components/layout/sidebar-shell";
import { CloseDayPageShell } from "@/components/transactions/close-day-page-shell";
import { getDashboardData } from "@/lib/data/app";

export default async function TransactionsPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <CloseDayPageShell settings={data.settings} wallets={data.wallets} />
    </SidebarShell>
  );
}
