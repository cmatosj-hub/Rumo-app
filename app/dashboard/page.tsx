import { getDashboardData } from "@/lib/data/app";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <DashboardClient data={data} />
    </SidebarShell>
  );
}
