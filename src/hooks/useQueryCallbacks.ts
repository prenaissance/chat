import { type UseTRPCQueryResult } from "@trpc/react-query/shared";
import { useEffect } from "react";

type SuccessCallback<TData> = (data: TData) => void;
type ErrorCallback<TError> = (error: TError) => void;

type UseQueryCallbacksOptions<TData, TError> = {
  query: UseTRPCQueryResult<TData, TError>;
  onSuccess?: SuccessCallback<TData>;
  onError?: ErrorCallback<TError>;
  onDataChanged?: SuccessCallback<TData>;
};

export const useQueryCallbacks = <TData, TError>({
  query,
  onSuccess,
  onError,
  onDataChanged,
}: UseQueryCallbacksOptions<TData, TError>) => {
  const { data, error, status } = query;

  useEffect(() => {
    if (data) {
      onDataChanged?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (status === "success") {
      onSuccess?.(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  useEffect(() => {
    if (error) {
      onError?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);
};
