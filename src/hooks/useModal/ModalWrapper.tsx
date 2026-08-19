import { AntConfigProvider } from "@/App";
import type { CustomModalProps } from "@/components/CustomModal";

export interface ModalWrapperInstance {
  open: (props: CustomModalProps<any>) => void;
  close: () => void;
}

interface ModalWrapperProps {
  getContainer?: () => HTMLElement;
  modal: React.FC<any>;
  ref?: React.Ref<ModalWrapperInstance>;
}

const ModalWrapper = ({ getContainer, modal: Modal, ref }: ModalWrapperProps) => {
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
    <AntConfigProvider>
      <Modal
        getContainer={getContainer}
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
  );
};

export default ModalWrapper;
