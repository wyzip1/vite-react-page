import axios, { CancelToken, CancelTokenSource } from "axios";

type RequestResult<T> = T extends (...args: any[]) => Promise<infer V> ? V : never;

export default function useRequest<
  T extends (params: any, cancelToken?: CancelToken) => Promise<any>,
>(
  requestApi: T,
  options?: {
    params?: Parameters<T>[0] | undefined;
    manual?: boolean;
  },
): [
  (params: Parameters<T>[0]) => Promise<RequestResult<T>>,
  RequestResult<T> | undefined,
  boolean,
  React.Dispatch<React.SetStateAction<RequestResult<T> | undefined>>,
  () => void,
] {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<RequestResult<T>>();

  const cancelTokenSourceRef = useRef<CancelTokenSource>(axios.CancelToken.source());

  async function request(params: Parameters<T>[0]) {
    setLoading(true);
    try {
      const res = await requestApi(params, cancelTokenSourceRef.current.token);
      setData(res);
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
    request(options?.params);

    return cancelRequest;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [request, data, loading, setData, cancelRequest];
}
