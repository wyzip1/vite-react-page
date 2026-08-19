import useConfigurableEffect from "@/hooks/useConfigurableEffect";
import type { FormInstance, FormProps, ModalProps } from "antd";
import { Form, Modal } from "antd";

export type CustomModalProps<T = any> = Omit<ModalProps, "onOk"> & {
  onConfirm?: (data: T) => any | Promise<any>;
  form?: FormInstance;
  formProps?: FormProps;
};

export default function CustomModal<T = any>({
  children,
  onConfirm,
  form,
  formProps,
  ...props
}: CustomModalProps<T>) {
  const [actionLoading, setActionLoading] = useState(false);
  const isForm = form !== undefined;
  async function confirm(data: T) {
    setActionLoading(true);
    try {
      await onConfirm?.(data);
    } finally {
      setActionLoading(false);
    }
  }

  useConfigurableEffect(
    () => {
      if (props.open) return;
      form?.resetFields();
    },
    [form, props.open],
    { runOnMount: false },
  );

  return (
    <Modal
      confirmLoading={actionLoading}
      {...props}
      onOk={() => (isForm ? form.submit() : confirm(undefined as T))}
    >
      {isForm ? (
        <Form form={form} {...formProps} onFinish={confirm}>
          {children}
        </Form>
      ) : (
        children
      )}
    </Modal>
  );
}
