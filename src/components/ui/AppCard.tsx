import { PropsWithChildren } from "react";
import { Surface } from "react-native-paper";
import clsx from "clsx";

type AppCardProps = PropsWithChildren<{
  className?: string;
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}>;

export function AppCard({
  children,
  className,
  elevation = 1,
}: AppCardProps) {
  return (
    <Surface
      elevation={elevation}
      className={clsx(
        "rounded-card bg-surface p-card",
        className,
      )}
    >
      {children}
    </Surface>
  );
}