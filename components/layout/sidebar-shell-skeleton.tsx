import type React from "react";

import { Skeleton } from "@/components/ui/skeleton";

export function SidebarShellSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="glass-panel theme-border rounded-[2rem] border p-5 shadow-2xl shadow-black/30">
          <div className="accent-emerald-surface rounded-[1.5rem] border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1 space-y-3">
                <Skeleton className="h-4 w-28 rounded-full" />
                <Skeleton className="h-8 w-44 max-w-full" />
                <Skeleton className="h-4 w-full max-w-[15rem]" />
                <Skeleton className="h-4 w-5/6 max-w-[12rem]" />
              </div>
              <Skeleton className="h-10 w-10 shrink-0 rounded-2xl" />
            </div>
          </div>

          <div className="mt-6 space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="theme-border rounded-2xl border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>

          <div className="theme-border surface-soft mt-8 rounded-[1.5rem] border p-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-28 max-w-full" />
                <Skeleton className="h-4 w-40 max-w-full" />
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Skeleton className="h-11 w-full rounded-2xl" />
              <Skeleton className="h-11 w-full rounded-2xl" />
            </div>

            <Skeleton className="mt-3 h-11 w-full rounded-2xl" />
            <Skeleton className="mt-4 h-10 w-full rounded-2xl" />
          </div>
        </aside>

        <section className="glass-panel theme-border rounded-[2rem] border p-6 shadow-2xl shadow-black/30 lg:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
