import { useEffect, useRef } from "react";

export type UseIntervalOptions = {
  delay: number;
  isImmediate?: boolean;
  isEnabled?: boolean;
};

export const useInterval = (
  callback: () => void,
  { delay, isImmediate = false, isEnabled = true }: UseIntervalOptions
) => {
  const wasImmediatelyCalledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  if (isImmediate && !wasImmediatelyCalledRef.current && isEnabled) {
    callback();
    wasImmediatelyCalledRef.current = true;
  }

  useEffect(() => {
    if (isEnabled) {
      intervalRef.current = setInterval(callback, delay);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [callback, delay, isEnabled]);
};
