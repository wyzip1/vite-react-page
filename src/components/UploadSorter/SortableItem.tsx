import { createContext, type CSSProperties, type PropsWithChildren } from "react";
import type { DraggableSyntheticListeners, UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
  id: UniqueIdentifier;
  disabled?: Boolean;
}

interface Context {
  attributes: Record<string, any>;
  listeners: DraggableSyntheticListeners;
  ref(node: HTMLElement | null): void;
}

const SortableItemContext = createContext<Context>({
  attributes: {},
  listeners: undefined,
  ref() {},
});

export default function SortableItem({ children, id, disabled }: PropsWithChildren<Props>) {
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });
  const context = useMemo(
    () => ({
      attributes,
      listeners,
      ref: setActivatorNodeRef,
    }),
    [attributes, listeners, setActivatorNodeRef],
  );

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <SortableItemContext.Provider value={context}>
      <div className="relative" key={id} ref={setNodeRef} style={style}>
        {children}
        {!disabled && <DragHandle />}
      </div>
    </SortableItemContext.Provider>
  );
}

export function DragHandle() {
  const { attributes, listeners, ref } = useContext(SortableItemContext);

  return (
    <div
      className="w-full h-full absolute top-0 left-0"
      {...attributes}
      {...listeners}
      ref={ref}
    ></div>
  );
}
