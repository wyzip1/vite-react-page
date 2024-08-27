import { AntConfigProvider } from "@/App";
import { CustomModalProps } from "@/components/CustomModal";
import { Provider } from "react-redux";
import { store } from "@/store";
import React, { forwardRef, useImperativeHandle, useState } from "react";

export interface ModalWrapperInstance {
  open: (props: CustomModalProps<any>) => void;
  close: () => void;
}

interface ModalWrapperProps {
  getContainer?: () => HTMLElement;
  modal: React.FC<CustomModalProps<any>>;
}

const ModalWrapper = (
  props: ModalWrapperProps,
  ref: React.ForwardedRef<ModalWrapperInstance>,
) => {
  const [modalProps, setModalProps] = useState<CustomModalProps<any>>({});
  const [openModalState, setOpenModalState] = useState(false);

  useImperativeHandle(ref, () => ({
    open: v => {
      setOpenModalState(true);
      setModalProps(v);
    },
    close: () => setOpenModalState(false),
  }));

  return (
    <Provider store={store}>
      <AntConfigProvider>
        <props.modal
          getContainer={props.getContainer}
          {...modalProps}
          afterClose={() => {
            modalProps.afterClose?.();
            setModalProps({});
          }}
          open={openModalState}
          onConfirm={async data => {
            await modalProps?.onConfirm?.(data);
            setOpenModalState(false);
          }}
          onCancel={e => {
            modalProps.onCancel?.(e);
            setOpenModalState(false);
          }}
        />
      </AntConfigProvider>
    </Provider>
  );
};

export default forwardRef(ModalWrapper);
