import { getDashboardData } from "@/lib/data/app";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { ReportsClient } from "@/components/reports/reports-client";

export default async function RelatoriosPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <ReportsClient data={data} />
    </SidebarShell>
  );
}
