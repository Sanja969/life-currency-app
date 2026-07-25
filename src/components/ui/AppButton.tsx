import { Button } from "react-native-paper";

type AppButtonProps = React.ComponentProps<typeof Button>;

export function AppButton({
  mode = "contained",
  children,
  ...props
}: AppButtonProps) {
  return (
    <Button mode={mode} {...props}>
      {children}
    </Button>
  );
}