import { Button, ButtonProps } from "antd";
import React, { useState } from "react";

interface AsyncButtonProps extends Omit<ButtonProps, "onClick"> {
  onClick?(): Promise<void>;
}

const AsyncButton: React.FC<AsyncButtonProps> = ({ children, onClick, ...props }) => {
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
    <Button loading={actionLoading} onClick={click} {...props}>
      {children}
    </Button>
  );
};

export default AsyncButton;
