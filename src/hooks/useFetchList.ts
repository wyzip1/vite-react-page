import List from "@/api/model/List";
import { RequestResponse } from "@/api/request";
import Pagination from "@/api/model/Pagination";
import { useEffect, useRef, useState } from "react";
import useRequest from "./useRequest";

export type ItemType<T> = T extends (...args: any[]) => Promise<RequestResponse<List<infer V>>>
  ? V
  : never;

export default function useFetchList<
  T extends (...args: any[]) => Promise<RequestResponse<List<any>>>,
  PN extends string = "pageNum",
  PS extends string = "pageSize"
>(
  fetchApi: T,
  searchParams: Omit<Parameters<T>[0], PN | PS>,
  defaultOptions: {
    pageSize?: number;
    initSearch?: boolean;
    propName?: {
      pageNum?: PN;
      pageSize?: PS;
      total?: string;
      list?: string;
    };
  } = { initSearch: true }
): [
  (pageOptions: Pagination) => ReturnType<T>,
  { pageNum: number; pageSize: number; total: number; loading: boolean; list: ItemType<T>[] },
  {
    doSearch: () => ReturnType<T>;
    updateList: (callback?: ((list: Array<ItemType<T>>) => void) | undefined) => void;
    refreshList: () => ReturnType<T>;
  }
] {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultOptions?.pageSize || 10);

  const [request, data, loading, setData] = useRequest(fetchApi, undefined, false);

  const pageChangeRequestRef = useRef<{
    resolve: (v: any) => void;
    reject: (reason: any) => void;
  }>();

  const updateParams = (params: Pagination) => {
    return new Promise((rev, rej) => {
      pageChangeRequestRef.current = { resolve: rev, reject: rej };
      setPageNum(params.pageNum || pageNum);
      setPageSize(params.pageSize || pageSize);
    }) as ReturnType<T>;
  };

  const onSearch = (pageNum: number, pageSize: number) => {
    const params = {
      [defaultOptions.propName?.pageNum || "pageNum"]: pageNum,
      [defaultOptions.propName?.pageSize || "pageSize"]: pageSize,
      ...searchParams,
    };
    return request(params) as ReturnType<T>;
  };

  const doSearch = (): ReturnType<T> => {
    if (pageNum === 1) return onSearch(1, pageSize) as ReturnType<T>;
    else return updateParams({ pageNum: 1, pageSize });
  };

  const updateList = (callback?: (list: Array<ItemType<T>>) => void) => {
    setData(data => {
      callback?.(data?.data?.[defaultOptions.propName?.list || "list"] || []);
      return data ? { ...data } : undefined;
    });
  };

  const refreshList = () => {
    return onSearch(pageNum, pageSize);
  };

  const initRef = useRef<boolean>(true);

  useEffect(() => {
    if (initRef.current && !defaultOptions.initSearch) {
      initRef.current = false;
      return;
    }
    onSearch(pageNum, pageSize)
      .then(pageChangeRequestRef.current?.resolve)
      .catch(pageChangeRequestRef.current?.reject)
      .finally(() => {
        pageChangeRequestRef.current = undefined;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  return [
    updateParams,
    {
      pageNum,
      pageSize,
      total: data?.data?.[defaultOptions.propName?.total || "total"] || 0,
      loading,
      list: data?.data?.[defaultOptions.propName?.list || "list"] || [],
    },
    { doSearch, updateList, refreshList },
  ];
}
