import type React from "react";

import { getCurrentProfile } from "@/lib/data/app";

import { ShellSidebar } from "./shell-sidebar";

export async function SidebarShell({ children }: { children: React.ReactNode }) {
  const current = await getCurrentProfile();

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="shell-layout">
        <ShellSidebar profile={current.profile} />

        <section className="glass-panel theme-border min-w-0 rounded-[2rem] border p-6 shadow-2xl shadow-black/30 lg:p-8">
          {children}
        </section>
      </div>
    </main>
  );
}
