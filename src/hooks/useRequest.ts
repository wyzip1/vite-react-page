import type { CancelTokenSource } from "axios";
import axios from "axios";

export type RequestResult<T> = T extends (...args: any[]) => Promise<infer V> ? V : never;

export default function useRequest<T extends (...args: any[]) => Promise<any>>(
  requestApi: T,
  options?: {
    params?: Parameters<T>[0] | undefined;
    manual?: boolean;
  },
  handlerData?: (data: RequestResult<T>) => any,
): [
  (params: Parameters<T>[0]) => Promise<RequestResult<T>>,
  RequestResult<T> | undefined,
  boolean,
  React.Dispatch<
    React.SetStateAction<(Omit<RequestResult<T>, "data"> & { data?: any }) | undefined>
  >,
  () => void,
] {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RequestResult<T> | undefined>();
  const cancelTokenSourceRef = useRef<CancelTokenSource>(axios.CancelToken.source());

  async function request(params: Parameters<T>[0]) {
    setLoading(true);
    try {
      const res = await requestApi({
        cancelToken: cancelTokenSourceRef.current.token,
        ...params,
      });
      if (handlerData) {
        const value = handlerData(res);
        setData(value ? res : value);
      } else {
        setData(res);
      }
      return res;
    } finally {
      setLoading(false);
    }
  }

  function cancelRequest() {
    cancelTokenSourceRef.current.cancel();
    cancelTokenSourceRef.current = axios.CancelToken.source();
  }

  useEffect(() => {
    if (options?.manual) return cancelRequest;
    if (options?.params) {
      request(options.params);
    }
    return cancelRequest;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [request, data, loading, setData as any, cancelRequest];
}
