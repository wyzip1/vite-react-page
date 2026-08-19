import { LoadingOutlined, SmallDashOutlined } from "@ant-design/icons";
import type { PopoverProps } from "antd";
import { Popover } from "antd";
import React, { useState } from "react";

interface AutoActionsProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  trigger?: PopoverProps["trigger"];
  autoLoading?: boolean;
  len?: number;
}

type ProxyNodeProps = Omit<React.HTMLAttributes<HTMLElement>, "onClick"> & {
  onConfirm?: (e: React.MouseEvent) => any;
  getPopupContainer?: (e: HTMLElement) => HTMLElement;
  onClick?: (e: React.MouseEvent) => any;
  onOpenChange?: (open: boolean) => void;
};

export function proxyNode(
  node: React.ReactNode,
  callback: (props: ProxyNodeProps) => Partial<ProxyNodeProps>,
) {
  if (React.isValidElement<ProxyNodeProps>(node)) {
    // Event proxying must preserve the original child type, key, ref, and props.
    // eslint-disable-next-line @eslint-react/no-clone-element
    return React.cloneElement(node, callback(node.props));
  }
  return node;
}

function normalizeChildren(children: React.ReactNode): React.ReactNode[] {
  if (Array.isArray(children)) return children.flatMap(normalizeChildren);
  if (children == null || typeof children === "boolean") return [];
  return [children];
}

function getChildKey(child: React.ReactNode, position: number) {
  return React.isValidElement(child) && child.key != null
    ? String(child.key)
    : `auto-action-${position}`;
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
  const childrenNodes = normalizeChildren(children);
  const [childOpenStates, setChildOpenStates] = useState<Record<string, boolean>>({});

  return (
    <div className={["inline-flex", className].filter(Boolean).join(" ")} style={style}>
      {childrenNodes.slice(0, len).map((child, position) => (
        <React.Fragment key={getChildKey(child, position)}>{child}</React.Fragment>
      ))}
      {childrenNodes.length > len && (
        <Popover
          overlayInnerStyle={{ padding: "4px 0" }}
          trigger={trigger}
          open={open || Object.values(childOpenStates).some(Boolean)}
          onOpenChange={setOpen}
          content={
            <div className="flex flex-col">
              {childrenNodes.slice(len).map((child, position) => {
                const childKey = getChildKey(child, len + position);
                return (
                  <div
                    key={childKey}
                    className="mb-1 flex items-center justify-center"
                    style={{ minWidth: 88, height: 28 }}
                  >
                    <ProxyClickNode
                      autoLoading={autoLoading}
                      onChildHangOpenChange={v => {
                        setChildOpenStates(states => ({ ...states, [childKey]: v }));
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
