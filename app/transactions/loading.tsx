import { SidebarShellSkeleton } from "@/components/layout/sidebar-shell-skeleton";
import { CloseDayPageSkeleton } from "@/components/skeletons/app-page-skeletons";

export default function Loading() {
  return (
    <SidebarShellSkeleton>
      <CloseDayPageSkeleton />
    </SidebarShellSkeleton>
  );
}
