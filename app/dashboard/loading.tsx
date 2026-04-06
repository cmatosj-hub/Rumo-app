import { SidebarShellSkeleton } from "@/components/layout/sidebar-shell-skeleton";
import { DashboardPageSkeleton } from "@/components/skeletons/app-page-skeletons";

export default function Loading() {
  return (
    <SidebarShellSkeleton>
      <DashboardPageSkeleton />
    </SidebarShellSkeleton>
  );
}
