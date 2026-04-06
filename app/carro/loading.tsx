import { SidebarShellSkeleton } from "@/components/layout/sidebar-shell-skeleton";
import { CarPageSkeleton } from "@/components/skeletons/app-page-skeletons";

export default function Loading() {
  return (
    <SidebarShellSkeleton>
      <CarPageSkeleton />
    </SidebarShellSkeleton>
  );
}
