import { SidebarShellSkeleton } from "@/components/layout/sidebar-shell-skeleton";
import { ReportsPageSkeleton } from "@/components/skeletons/app-page-skeletons";

export default function Loading() {
  return (
    <SidebarShellSkeleton>
      <ReportsPageSkeleton />
    </SidebarShellSkeleton>
  );
}
