import React, { useState, createRef } from "react";
import { Modal } from "antd";
import Action from "../Action";
import Form, { FormInstace } from "../Form";

import type { ButtonProps } from "antd";
import type { FormProps } from "../Form";

interface ATFormProps extends Omit<FormProps, "onSubmit"> {
  onSubmit: (data: Record<string, unknown>) => Promise<unknown | undefined>;
}

interface ActionToFormProps {
  btnProps: ButtonProps;
  formProps: ATFormProps;
  modalTitle?: string;
  children: React.ReactNode;
  autoConfirmClose?: Boolean;
}

type OnClick = (e: React.MouseEvent<HTMLElement, MouseEvent>) => void;

const covertOnClick = (callback: OnClick, origin?: OnClick): OnClick => {
  return e => {
    callback(e);
    origin?.(e);
  };
};

const setBtnProps = (props: ButtonProps, onClick: OnClick) => {
  props.onClick = covertOnClick(onClick, props.onClick);
};

export default function ActionToForm({
  btnProps,
  children,
  formProps,
  modalTitle,
  autoConfirmClose = true,
}: ActionToFormProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const FormInstance = createRef<FormInstace>();

  const cancel = () => {
    setOpen(false);
    FormInstance.current?.reset();
  };

  const onConfirm = () => FormInstance.current?.submit();

  setBtnProps(btnProps, () => setOpen(true));

  const originSubmit = formProps.onSubmit;

  formProps.onSubmit = async (data: Record<string, unknown>) => {
    try {
      setConfirmLoading(true);
      await originSubmit?.(data);
      autoConfirmClose && cancel();
    } catch (error) {
      console.log("onSubmit Error:", error);
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <>
      <Action btnProps={btnProps}>{children}</Action>
      <Modal
        title={modalTitle}
        open={open}
        closable
        onCancel={cancel}
        onOk={onConfirm}
        confirmLoading={confirmLoading}
      >
        <Form ref={FormInstance} {...formProps} showBtns={false} />
      </Modal>
    </>
  );
}
