import type { CustomModalProps } from "@/components/CustomModal";
import { guid } from "@/utils";
import { createRoot } from "react-dom/client";
import type { ModalWrapperInstance } from "./ModalWrapper";
import ModalWrapper from "./ModalWrapper";

export default function useModal<T extends CustomModalProps<any>>(
  Modal: (props: T) => React.ReactNode,
  options?: {
    getContainer?: () => HTMLElement;
  },
) {
  const modalRef = useRef<ModalWrapperInstance>(null);
  const modelNodeRef = useRef<HTMLDivElement>();
  const ModalRcEl = useMemo(
    () => <ModalWrapper ref={modalRef} modal={Modal} getContainer={() => modelNodeRef.current!} />,
    [Modal],
  );

  function openModal(modalProps?: T) {
    return new Promise<Parameters<NonNullable<T["onConfirm"]>>[0]>((rev, rej) => {
      modalRef.current?.open({
        ...modalProps,
        onConfirm: async data => {
          await modalProps?.onConfirm?.(data);
          rev(data);
        },
        onCancel(e) {
          rej(e);
          return modalProps?.onCancel?.(e);
        },
      });
    });
  }

  useEffect(() => {
    const container = options?.getContainer?.() || document.getElementById("app")!;
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

  return openModal;
}
