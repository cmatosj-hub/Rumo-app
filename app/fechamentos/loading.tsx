import { SidebarShellSkeleton } from "@/components/layout/sidebar-shell-skeleton";
import { ClosuresPageSkeleton } from "@/components/skeletons/app-page-skeletons";

export default function Loading() {
  return (
    <SidebarShellSkeleton>
      <ClosuresPageSkeleton />
    </SidebarShellSkeleton>
  );
}
