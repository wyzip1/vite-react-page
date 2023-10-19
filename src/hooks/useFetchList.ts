import List from "@/api/model/List";
import { Response } from "@/api/request";
import Pagination from "@/api/model/Pagination";
import { useEffect, useRef, useState } from "react";
import useRequest from "./useRequest";

type ItemType<T> = T extends (...args: any[]) => Promise<Response<List<infer V>>> ? V : never;

export default function useFetchList<
  T extends (...args: any[]) => Promise<Response<List<any>>>,
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
  (pageOptions: Pagination) => void,
  { pageNum: number; pageSize: number; total: number; loading: boolean; list: ItemType<T>[] },
  {
    doSearch: () => void;
    updateList: (callback?: ((list: Array<ItemType<T>>) => void) | undefined) => void;
    refreshList: () => void;
  }
] {
  const [pageNum, setPageNum] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(defaultOptions?.pageSize || 10);

  const [request, data, loading, setData] = useRequest(fetchApi);

  const updateParams = (params: Pagination) => {
    setPageNum(params.pageNum || pageNum);
    setPageSize(params.pageSize || pageSize);
  };

  const onSearch = (pageNum: number, pageSize: number) => {
    const params = {
      [defaultOptions.propName?.pageNum || "pageNum"]: pageNum,
      [defaultOptions.propName?.pageSize || "pageSize"]: pageSize,
      ...searchParams,
    };
    request(params);
  };

  const doSearch = () => {
    if (pageNum === 1) onSearch(1, pageSize);
    else setPageNum(1);
  };

  const updateList = (callback?: (list: Array<ItemType<T>>) => void) => {
    setData(data => {
      callback?.(data?.data[defaultOptions.propName?.list || "list"] || []);
      return data ? { ...data } : undefined;
    });
  };

  const refreshList = () => {
    onSearch(pageNum, pageSize);
  };

  const initRef = useRef<boolean>(true);

  useEffect(() => {
    if (initRef.current && !defaultOptions.initSearch) {
      initRef.current = false;
      return;
    }
    onSearch(pageNum, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, pageSize]);

  return [
    updateParams,
    {
      pageNum,
      pageSize,
      total: data?.data[defaultOptions.propName?.total || "total"] || 0,
      loading,
      list: data?.data[defaultOptions.propName?.list || "list"] || [],
    },
    { doSearch, updateList, refreshList },
  ];
}
