import { Button, ButtonProps } from "antd";

interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?(): any | Promise<any>;
}

const AsyncButton = (
  { children, onClick, ...props }: AsyncButtonProps,
  ref: React.LegacyRef<HTMLButtonElement | HTMLAnchorElement>,
) => {
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const click: ButtonProps["onClick"] = async () => {
    setActionLoading(true);
    try {
      await onClick?.();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Button ref={ref} loading={actionLoading} onClick={click} {...props}>
      {children}
    </Button>
  );
};

export default forwardRef(AsyncButton);
