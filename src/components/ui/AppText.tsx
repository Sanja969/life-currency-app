import { PropsWithChildren } from "react";
import clsx from "clsx";
import { Text } from "react-native-paper";

type AppTextVariant = "display" | "headline" | "title" | "body" | "caption";

type AppTextProps = PropsWithChildren<{
  variant?: AppTextVariant;
  className?: string;
  align?: "left" | "center" | "right";
}>;

const alignClasses = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

const variantClasses: Record<AppTextVariant, string> = {
  display: "text-hero font-bold text-textPrimary",

  headline: "text-h1 font-bold text-textPrimary",

  title: "text-title font-semibold text-textPrimary",

  body: "text-body text-textPrimary",

  caption: "text-caption text-textSecondary",
};

export function AppText({
  variant = "body",
  className,
  align = "left",
  children,
}: AppTextProps) {
  return (
    <Text
      className={clsx(
        variantClasses[variant],
        alignClasses[align],
        className,
      )}
    >
      {children}
    </Text>
  );
}
