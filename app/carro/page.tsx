import { CarClient } from "@/components/car/car-client";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { getDashboardData } from "@/lib/data/app";

export default async function CarroPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <CarClient data={data} />
    </SidebarShell>
  );
}
