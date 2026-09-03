import { PropsWithChildren } from "react";

import { AppCard } from "./AppCard";

type StatCardProps = PropsWithChildren<{
  className?: string;
}>;

export function StatCard({
  children,
  className,
}: StatCardProps) {
  return (
    <AppCard className={className}>
      {children}
    </AppCard>
  );
}