// import { Form } from "antd";
import { LoadingOutlined, SmallDashOutlined } from "@ant-design/icons";
import { Popover, PopoverProps } from "antd";
import React, { useState } from "react";

interface FormDescProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  trigger?: PopoverProps["trigger"];
  autoLoading?: boolean;
}

export function proxyNode(
  node: React.ReactNode,
  callback: (cn: React.HTMLAttributes<HTMLElement>) => React.HTMLAttributes<HTMLElement>
) {
  if (React.isValidElement(node)) {
    console.log("proxy", node);

    return React.cloneElement(node, callback(node.props));
  }
  return node;
}

export const ProxyClickNode: React.FC<{
  children?: React.ReactNode;
  onClick?(e: React.MouseEvent): any | Promise<any>;
  autoLoading?: boolean;
}> = ({ children, onClick, autoLoading = true }) => {
  const [loading, setLoading] = useState(false);

  const node = proxyNode(children, props => ({
    onClick: async e => {
      setLoading(true);
      try {
        await props.onClick?.(e);
        await onClick?.(e);
      } finally {
        setLoading(false);
      }
    },
  }));

  return autoLoading && loading ? <LoadingOutlined /> : node;
};

const Actions: React.FC<FormDescProps> = ({
  children,
  className,
  style,
  trigger,
  autoLoading,
}) => {
  const [open, setOpen] = useState<boolean>(false);
  const childrenNodes = React.Children.map(children, c => c);

  return (
    <div className={`inline-flex ${className}`} style={style}>
      {childrenNodes?.slice(0, 3)}
      {(childrenNodes?.length || 4) > 3 && (
        <Popover
          overlayInnerStyle={{ padding: "4px 0" }}
          trigger={trigger}
          open={open}
          onOpenChange={setOpen}
          content={
            <div className="flex flex-col">
              {childrenNodes?.slice(3).map((child, i) => {
                return (
                  <div
                    key={i}
                    className="mb-1 flex items-center justify-center"
                    style={{ width: 88, height: 28 }}
                  >
                    <ProxyClickNode
                      autoLoading={autoLoading}
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

export default Actions;
