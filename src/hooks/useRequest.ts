import type { AxiosError, AxiosResponse, CancelTokenSource } from "axios";
import axios, { isAxiosError } from "axios";

type ApiResult<T> = T extends (...args: any[]) => Promise<infer V> ? V : never;
type SuccessResult<T> = Exclude<ApiResult<T>, AxiosError>;

export type RequestResult<T> =
  SuccessResult<T> extends AxiosResponse<infer V> ? V : SuccessResult<T>;

function unwrapResponse<T>(response: T): T extends AxiosResponse<infer V> ? V : T {
  if (axios.isAxiosError(response)) return response as any;
  if (response && typeof response === "object" && "status" in response && "headers" in response) {
    return (response as unknown as AxiosResponse).data as any;
  }
  return response as any;
}

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
    try {
      setLoading(true);
      const response = await requestApi({
        cancelToken: cancelTokenSourceRef.current.token,
        ...params,
      });
      if (isAxiosError(response)) throw response;
      const res = unwrapResponse(response);
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
    request(options?.params);
    return cancelRequest;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [request, data, loading, setData as any, cancelRequest];
}
