import { CustomModalProps } from "@/components/CustomModal";
import { guid } from "@/utils";
import React, { useEffect, useMemo, useRef } from "react";
import { createRoot } from "react-dom/client";
import ModalWrapper, { ModalWrapperInstance } from "./ModalWrapper";

export default function useModal<T>(
  Modal: (props: CustomModalProps<T>) => React.ReactNode,
  options?: {
    props?: CustomModalProps<T>;
    getContainer?: () => HTMLElement;
  },
) {
  const modalRef = useRef<ModalWrapperInstance>(null);
  const modelNodeRef = useRef<HTMLDivElement>();
  const ModalRcEl = useMemo(
    () => (
      <ModalWrapper ref={modalRef} modal={Modal} getContainer={() => modelNodeRef.current!} />
    ),
    [Modal],
  );

  function openModal(cProps?: CustomModalProps<T>) {
    return new Promise((rev, rej) => {
      const modalProps = { ...options?.props, ...cProps };
      modalRef.current?.open({
        ...modalProps,
        onConfirm: async data => {
          const res = await modalProps.onConfirm?.(data);
          rev(res);
          return res;
        },
        onCancel(e) {
          rej(e);
          return modalProps.onCancel?.(e);
        },
      });
    });
  }

  useEffect(() => {
    const container = options?.getContainer?.() || document.getElementById("root")!;
    const modelNode = document.createElement("div");
    modelNode.id = guid();
    container.appendChild(modelNode);
    const root = createRoot(modelNode!);
    root.render(ModalRcEl);
    modelNodeRef.current = modelNode;

    return () => {
      modelNode.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { openModal };
}
