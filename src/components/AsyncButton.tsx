import type { ButtonProps } from "antd";
import { Button } from "antd";

interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?(): any | Promise<any>;
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>;
}

const AsyncButton = ({ children, onClick, ref, ...props }: AsyncButtonProps) => {
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

export default AsyncButton;
