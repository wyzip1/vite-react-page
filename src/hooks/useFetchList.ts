import useRequest from "./useRequest";

export interface Pagination {
  pageNum: number;
  pageSize: number;
}

export interface List<T> {
  list?: T[];
  total?: number;
}

export interface DoSearchOptions {
  /** 是否同时将 pageSize 恢复为 useFetchList 配置的默认值。 */
  resetPageSize?: boolean;
}

export interface FetchListOptions<
  T extends (...args: any[]) => Promise<any>,
  PN extends string = "pageNum",
  PS extends string = "pageSize",
> {
  pageSize?: number;
  manual?: boolean;
  initParams?: FetchListParams<T, PN, PS>;
  propName?: {
    pageNum?: PN;
    pageSize?: PS;
    total?: string;
    list?: string;
  };
}

export type ItemType<T> = T extends (...args: any[]) => Promise<{ data?: List<infer V> }>
  ? V
  : never;

export type FetchListParams<
  T extends (...args: any[]) => Promise<any>,
  PN extends string = "pageNum",
  PS extends string = "pageSize",
> = Omit<Parameters<T>[0], "query" | "body"> & {
  query?: Omit<Parameters<T>[0]["query"], PN | PS>;
  body?: Omit<Parameters<T>[0]["body"], PN | PS>;
};

export default function useFetchList<
  T extends (...args: any[]) => Promise<{ data?: List<any> }>,
  PN extends string = "pageNum",
  PS extends string = "pageSize",
>(
  fetchApi: T,
  options: FetchListOptions<T, PN, PS> = { manual: false },
): [
  (pageOptions: Pagination) => ReturnType<T>,
  {
    pageNum: number;
    pageSize: number;
    total: number;
    loading: boolean;
    list: Array<ItemType<T>>;
  },
  {
    doSearch: (params?: FetchListParams<T, PN, PS>, options?: DoSearchOptions) => ReturnType<T>;
    updateList: (callback?: (list: Array<ItemType<T>>) => void) => void;
    resetState: () => void;
  },
] {
  const defaultPageSize = options.pageSize ?? 10;
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [request, data, loading, setData] = useRequest(fetchApi, { manual: true });

  const searchParamsRef = useRef<FetchListParams<T, PN, PS>>(
    options.initParams ?? ({} as FetchListParams<T, PN, PS>),
  );
  const pageChangeRequestRef = useRef<{
    resolve: (value: any) => void;
    reject: (reason: unknown) => void;
  }>(null);

  const requestList = (nextPageNum: number, nextPageSize: number): ReturnType<T> => {
    const searchParams = searchParamsRef.current;
    const paramsName = searchParams.body ? "body" : "query";
    const params = {
      [paramsName]: {
        ...searchParams[paramsName],
        [options.propName?.pageNum ?? "pageNum"]: nextPageNum,
        [options.propName?.pageSize ?? "pageSize"]: nextPageSize,
      },
    } as Parameters<T>[0];

    return request(params) as ReturnType<T>;
  };

  const updatePagination = (nextPageNum: number, nextPageSize: number): ReturnType<T> => {
    if (nextPageNum === pageNum && nextPageSize === pageSize) {
      return requestList(nextPageNum, nextPageSize);
    }

    return new Promise((resolve, reject) => {
      pageChangeRequestRef.current = { resolve, reject };
      setPageNum(nextPageNum);
      setPageSize(nextPageSize);
    }) as ReturnType<T>;
  };

  const setPageInfo = (pageOptions: Pagination): ReturnType<T> => {
    return updatePagination(pageOptions.pageNum ?? pageNum, pageOptions.pageSize ?? pageSize);
  };

  const doSearch = (
    params?: FetchListParams<T, PN, PS>,
    searchOptions: DoSearchOptions = {},
  ): ReturnType<T> => {
    if (params) searchParamsRef.current = params;
    const nextPageSize = searchOptions.resetPageSize ? defaultPageSize : pageSize;
    return updatePagination(1, nextPageSize);
  };

  const updateList = (callback?: (list: Array<ItemType<T>>) => void) => {
    setData(data => {
      callback?.(data?.[options.propName?.list ?? "list"] || []);
      return data ? { ...data } : undefined;
    });
  };

  const isResetRef = useRef(false);
  const resetState = () => {
    setPageNum(1);
    setPageSize(defaultPageSize);
    setData(undefined);
    if (pageNum !== 1 || pageSize !== defaultPageSize) isResetRef.current = true;
  };

  const initRef = useRef(true);

  useEffect(() => {
    if (isResetRef.current) {
      isResetRef.current = false;
      return;
    }
    if (initRef.current && options.manual) {
      initRef.current = false;
      return;
    }
    requestList(pageNum, pageSize)
      .then(pageChangeRequestRef.current?.resolve)
      .catch(pageChangeRequestRef.current?.reject)
      .finally(() => {
        pageChangeRequestRef.current = null;
      });
    // 分页变化时始终使用最近一次 doSearch 保存的查询参数。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  return [
    setPageInfo,
    {
      pageNum,
      pageSize,
      total: data?.data?.[options.propName?.total ?? "total"] || 0,
      loading,
      list: data?.data?.[options.propName?.list ?? "list"] || [],
    },
    { doSearch, updateList, resetState },
  ];
}
