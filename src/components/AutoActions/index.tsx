import { LoadingOutlined, SmallDashOutlined } from "@ant-design/icons";
import { Popover, PopoverProps } from "antd";
import React, { useState } from "react";

interface AutoActionsProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  trigger?: PopoverProps["trigger"];
  autoLoading?: boolean;
  len?: number;
}

export function proxyNode(
  node: React.ReactNode,
  callback: (
    cn: Omit<React.HTMLAttributes<HTMLElement>, "onClick"> & {
      onConfirm?: (e: React.MouseEvent) => any;
      getPopupContainer?: (e: HTMLElement) => HTMLElement;
      onClick?: (e: React.MouseEvent) => any;
      onOpenChange?: (open: boolean) => void;
    },
  ) => React.HTMLAttributes<HTMLElement>,
) {
  if (React.isValidElement(node)) {
    return React.cloneElement(node, callback(node.props));
  }
  return node;
}

export const ProxyClickNode: React.FC<{
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent): any | Promise<any>;
  onChildHangOpenChange?: (open: boolean) => void;
  autoLoading?: boolean;
}> = ({ children, onClick, onChildHangOpenChange, autoLoading = true }) => {
  const [loading, setLoading] = useState(false);

  const node = proxyNode(children, props => {
    const result: {
      onConfirm?: (e: React.MouseEvent) => any;
      onClick?: (e: React.MouseEvent) => any;
      getPopupContainer?: (e: HTMLElement) => HTMLElement;
      onOpenChange?: (open: boolean) => void;
    } = {};

    if ("onConfirm" in props) {
      result.onConfirm = async e => {
        await props.onConfirm!(e);
        await onClick?.(e);
      };

      result.getPopupContainer = e => {
        return e.parentElement || document.body;
      };

      result.onOpenChange = onChildHangOpenChange;
    } else {
      result.onClick = async e => {
        setLoading(true);
        try {
          await props.onClick?.(e);
          await onClick?.(e);
        } finally {
          setLoading(false);
        }
      };
    }

    return result;
  });

  return autoLoading && loading ? <LoadingOutlined /> : node;
};

const AutoActions: React.FC<AutoActionsProps> = ({
  children,
  className,
  style,
  trigger,
  autoLoading,
  len = 3,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const childrenNodes = React.Children.map(children, c => c);
  const [childsHangOpen, setChildsHangOpen] = useState<boolean[]>([]);

  return (
    <div className={`inline-flex ${className}`} style={style}>
      {childrenNodes?.slice(0, len)}
      {(childrenNodes?.length || len + 1) > len && (
        <Popover
          overlayInnerStyle={{ padding: "4px 0" }}
          trigger={trigger}
          open={open || childsHangOpen.some(v => v)}
          onOpenChange={setOpen}
          content={
            <div className="flex flex-col">
              {childrenNodes?.slice(len).map((child, i) => {
                return (
                  <div
                    key={i}
                    className="mb-1 flex items-center justify-center"
                    style={{ minWidth: 88, height: 28 }}
                  >
                    <ProxyClickNode
                      autoLoading={autoLoading}
                      onChildHangOpenChange={v => {
                        childsHangOpen[i] = v;
                        setChildsHangOpen([...childsHangOpen]);
                      }}
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      {child}
                    </ProxyClickNode>
                  </div>
                );
              })}
            </div>
          }
        >
          <div className=" leading-4" style={{ padding: "3px 6px" }}>
            <a>
              <SmallDashOutlined />
            </a>
          </div>
        </Popover>
      )}
    </div>
  );
};

export default AutoActions;
