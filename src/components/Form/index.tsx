import React, { useImperativeHandle, useMemo, forwardRef } from "react";
import { Form as AForm, Input, Select, SelectProps, Button, Row, Col } from "antd";
import { FormStyled } from "./styled";

import type { FormItemProps, InputProps, FormProps as AFormProps } from "antd";

type TypeMap = "input" | "select";
type ValuePropsMap = InputProps | SelectProps;

export interface ItemConfig {
  type: TypeMap;
  itemProps: FormItemProps;
  valueProps?: ValuePropsMap;
}

export interface FormProps {
  formProps?: AFormProps;
  itemConfig: ItemConfig[];
  title?: React.ReactNode | string;
  titleAlign?: "center" | "left" | "right";
  style?: React.CSSProperties;
  onReset?: () => void;
  onSubmit?: (data: any) => void;
  showBtns?: boolean | { submit: boolean; reset: boolean };
}

export interface FormInstace {
  submit: () => void;
  reset: () => void;
}

function getControlValue<T extends TypeMap>(type: T, props?: ValuePropsMap) {
  switch (type) {
    // eslint-disable-next-line prettier/prettier
    case "input": return <Input {...(props as InputProps)} />;
    // eslint-disable-next-line prettier/prettier
    case "select": return <Select {...(props as SelectProps)} />;
  }
}

function Form(
  {
    itemConfig,
    formProps = { labelCol: { span: 4 } },
    title,
    titleAlign = "left",
    style,
    onReset,
    onSubmit,
    showBtns = true,
  }: FormProps,
  ref: React.Ref<FormInstace>
) {
  const [form] = AForm.useForm();

  useImperativeHandle(ref, () => ({
    submit: () => form.submit(),
    reset: () => form.resetFields(),
  }));

  const show = useMemo(() => {
    if (showBtns === true) return { submit: true, reset: true };
    return showBtns;
  }, [showBtns]);

  return (
    <FormStyled style={style} titleAlign={titleAlign}>
      <AForm form={form} onFinish={onSubmit} onReset={onReset} {...formProps}>
        {title && <div className="form-title">{title}</div>}
        {itemConfig.map((config, idx) => (
          <AForm.Item key={idx} {...config.itemProps}>
            {getControlValue(config.type, config.valueProps)}
          </AForm.Item>
        ))}
      </AForm>
      {show && (
        <Row>
          <Col span={formProps?.labelCol?.span}></Col>
          <div className="footer-btns">
            {show.submit && (
              <Button type="primary" onClick={() => form.submit()}>
                提交
              </Button>
            )}
            {show.reset && <Button onClick={() => form.resetFields()}>重置</Button>}
          </div>
        </Row>
      )}
    </FormStyled>
  );
}

export default forwardRef(Form);
