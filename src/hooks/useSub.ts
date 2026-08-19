import { guid } from "@/utils";

interface EventItem {
  name: string;
  callback: (...args: any[]) => any;
}

const globalEvents: Record<string, EventItem[]> = {};

export default function useSub(events?: EventItem[]) {
  const subIdRef = useRef(guid());

  useEffect(() => {
    const subId = subIdRef.current;
    globalEvents[subId] = events || [];

    return () => {
      delete globalEvents[subId];
    };
  }, [events]);
}

export function dispatchSubEvents(name: string, ...args: any[]) {
  const eventsList = Object.keys(globalEvents)
    .map(k => globalEvents[k])
    .flat(2);
  for (const event of eventsList) {
    if (event.name !== name) continue;

    event.callback(...args);
  }
}
