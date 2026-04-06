import type React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-10 w-64 max-w-full" />
      </section>

      <Card className="shadow-none">
        <CardContent className="p-5">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32 rounded-full" />
            <Skeleton className="h-5 w-full max-w-3xl" />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <MetricCardSkeleton key={index} featured={index === 0} />
        ))}
      </section>

      <Card className="overflow-hidden ring-1 ring-emerald-300/18">
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 w-72 max-w-full" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>

            <div className="flex lg:justify-end">
              <Skeleton className="h-12 w-full rounded-2xl lg:min-w-64 lg:w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-5 space-y-2">
            <Skeleton className="h-4 w-44 rounded-full" />
            <Skeleton className="h-7 w-52 max-w-full" />
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <SupportMetricSkeleton key={index} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function ClosuresPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageIntroSkeleton />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-56 max-w-full" />
              <Skeleton className="h-4 w-80 max-w-full" />
            </div>

            <div className="theme-border inline-flex rounded-2xl border p-1">
              <Skeleton className="h-10 w-28 rounded-xl" />
              <Skeleton className="ml-1 h-10 w-36 rounded-xl" />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <ClosureListRowSkeleton key={index} />
            ))}
          </div>

          <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <SummaryMetricSkeleton key={index} />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-2xl" />
                <Skeleton className="h-10 w-10 rounded-2xl" />
              </div>
              <Skeleton className="h-6 w-36 max-w-full" />
            </div>

            <CalendarGridSkeleton />

            <div className="theme-border surface-soft flex flex-wrap gap-4 rounded-2xl border px-4 py-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Skeleton className="h-2.5 w-2.5 rounded-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-start">
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>
    </div>
  );
}

export function ReportsPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageIntroSkeleton />

      <section className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-44 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <HistoryRowSkeleton key={index} />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-44 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, index) => (
              <ReadingRowSkeleton key={index} />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CarPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageIntroSkeleton />

      <section className="grid gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <MetricCardSkeleton key={index} />
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <HistoryRowSkeleton key={index} badge />
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-2">
            <Skeleton className="h-7 w-56 max-w-full" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <HistoryRowSkeleton key={index} compactValue />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function CloseDayPageSkeleton() {
  return (
    <div className="space-y-8">
      <PageIntroSkeleton withAction />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-7 w-44 max-w-full" />
              <Skeleton className="h-4 w-96 max-w-full" />
            </div>
            <Skeleton className="h-7 w-28 rounded-full" />
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          <FormSectionSkeleton fields={1} columnsClassName="md:max-w-xs" footer />

          <div className="grid gap-4 xl:grid-cols-2">
            <FormSectionSkeleton fields={3} columnsClassName="md:grid-cols-3" footer />
            <FormSectionSkeleton fields={6} columnsClassName="sm:grid-cols-2 xl:grid-cols-3" footer />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <FormSectionSkeleton fields={2} columnsClassName="sm:grid-cols-2" footer />
            <FormSectionSkeleton fields={2} columnsClassName="sm:grid-cols-2" footer />
            <FormSectionSkeleton fields={3} columnsClassName="sm:grid-cols-2" footer />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <FormSectionSkeleton fields={8} columnsClassName="md:grid-cols-2 2xl:grid-cols-4" />
            <FormSectionSkeleton fields={3} columnsClassName="space-y-4" stackFields footer>
              <Skeleton className="h-12 w-full rounded-2xl" />
              <Skeleton className="h-4 w-48 max-w-full" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </FormSectionSkeleton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PageIntroSkeleton({ withAction = false }: { withAction?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-2xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-9 w-72 max-w-full" />
        </div>
      </div>

      {withAction ? <Skeleton className="h-11 w-36 rounded-2xl" /> : null}
    </div>
  );
}

function MetricCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <Card className={featured ? "ring-1 ring-emerald-300/20" : undefined}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-4">
            <Skeleton className="h-4 w-32 rounded-full" />
            <Skeleton className="h-10 w-40 max-w-full" />
          </div>
          <Skeleton className="h-12 w-12 shrink-0 rounded-2xl" />
        </div>

        <div className="mt-5 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>
    </Card>
  );
}

function SupportMetricSkeleton() {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-2xl" />
      </div>
      <Skeleton className="mt-4 h-8 w-28 max-w-full" />
    </div>
  );
}

function SummaryMetricSkeleton() {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <Skeleton className="h-3.5 w-20 rounded-full" />
      <Skeleton className="mt-3 h-8 w-24 max-w-full" />
    </div>
  );
}

function ClosureListRowSkeleton() {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-14 rounded-full" />
              <Skeleton className="h-4 w-20 max-w-full" />
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Skeleton className="h-11 w-24 rounded-2xl" />
          <Skeleton className="h-11 w-20 rounded-2xl" />
          <Skeleton className="h-11 w-20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

function CalendarGridSkeleton() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full rounded-full" />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="theme-border rounded-2xl border p-3">
            <Skeleton className="h-3 w-6 rounded-full" />
            <Skeleton className="mt-5 h-5 w-full" />
            <Skeleton className="mt-2 h-3 w-3/4" />
            <Skeleton className="mt-6 h-2.5 w-2.5 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HistoryRowSkeleton({
  badge = false,
  compactValue = false,
}: {
  badge?: boolean;
  compactValue?: boolean;
}) {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28 rounded-full" />
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>

        {badge ? (
          <Skeleton className="h-7 w-24 rounded-full" />
        ) : (
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className={cn("h-7 rounded-full", compactValue ? "w-20" : "w-24")} />
          </div>
        )}
      </div>
    </div>
  );
}

function ReadingRowSkeleton() {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <Skeleton className="h-3.5 w-40 rounded-full" />
      <Skeleton className="mt-2 h-8 w-28 max-w-full" />
    </div>
  );
}

function FormSectionSkeleton({
  fields,
  columnsClassName,
  footer = false,
  stackFields = false,
  children,
}: {
  fields: number;
  columnsClassName: string;
  footer?: boolean;
  stackFields?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="theme-border surface-soft flex flex-col rounded-[1.5rem] border p-4 sm:p-5">
      <div className="mb-4 space-y-2">
        <Skeleton className="h-6 w-40 max-w-full" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>

      <div className={cn(stackFields ? columnsClassName : `grid gap-4 ${columnsClassName}`)}>
        {Array.from({ length: fields }).map((_, index) => (
          <FieldSkeleton key={index} />
        ))}
      </div>

      {children ? <div className="mt-4 space-y-3">{children}</div> : null}
      {footer ? <Skeleton className="mt-4 h-20 w-full rounded-2xl" /> : null}
    </div>
  );
}

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24 rounded-full" />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}
