import React, { useState } from "react";
import { Form, FormInstance, FormProps, Modal, ModalProps } from "antd";

export type CustomModalProps<T> = Omit<ModalProps, "onOk"> & {
  onConfirm?: (data?: T) => any | Promise<any>;
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
  async function confirm(data?: T) {
    setActionLoading(true);
    try {
      await onConfirm?.(data);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <Modal
      confirmLoading={actionLoading}
      {...props}
      onOk={() => (isForm ? form.submit() : confirm())}
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
