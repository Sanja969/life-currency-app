import { Card, Text } from "react-native-paper";

type StatisticsCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
};

export function StatisticsCard({
  title,
  value,
  subtitle,
}: StatisticsCardProps) {
  return (
    <Card mode="outlined">
      <Card.Content className="gap-1">
        <Text variant="titleSmall">{title}</Text>

        <Text variant="headlineMedium">{value}</Text>

        {subtitle && <Text variant="bodySmall">{subtitle}</Text>}
      </Card.Content>
    </Card>
  );
}
