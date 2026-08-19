/**
 * 可通过声明合并补充事件名与参数的对应关系。
 *
 * @example
 * declare module "@/hooks/useSub" {
 *   interface SubEventMap {
 *     "select-record": [id: string];
 *   }
 * }
 */
export interface SubEventMap {
  [eventName: string]: unknown[];
}

type EventCallback<TArgs extends unknown[]> = {
  bivarianceHack(...args: TArgs): unknown;
}["bivarianceHack"];

export type EventItem<TName extends keyof SubEventMap & string = keyof SubEventMap & string> = {
  [TEventName in TName]: {
    name: TEventName;
    callback: EventCallback<SubEventMap[TEventName]>;
  };
}[TName];

const EMPTY_EVENTS: readonly EventItem[] = [];
const globalEvents = new Map<symbol, readonly EventItem[]>();

function reportCallbackError(name: string, error: unknown) {
  console.error(`[useSub] 事件 “${name}” 的回调执行失败。`, error);
}

export default function useSubEvent<const TName extends keyof SubEventMap & string>(
  events?: readonly EventItem<TName>[],
) {
  const [subId] = useState(() => Symbol("useSub"));

  useLayoutEffect(() => {
    globalEvents.set(subId, events ?? EMPTY_EVENTS);
  }, [events, subId]);

  useLayoutEffect(() => {
    return () => {
      globalEvents.delete(subId);
    };
  }, [subId]);
}

export function dispatchSubEvents<const TName extends keyof SubEventMap & string>(
  name: TName,
  ...args: SubEventMap[TName]
) {
  const eventsList = Array.from(globalEvents.values()).flat();

  for (const event of eventsList) {
    if (event.name !== name) continue;

    try {
      void Promise.resolve(event.callback(...args)).catch(error => {
        reportCallbackError(name, error);
      });
    } catch (error) {
      reportCallbackError(name, error);
    }
  }
}
