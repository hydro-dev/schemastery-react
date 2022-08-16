import { useRef, useEffect } from 'react';

type Callback<T> = (prev: T | undefined) => void;
type Config = {
  immediate?: boolean;
  deep?: boolean;
};

export default function useWatch<T>(dep: T, callback: Callback<T>, config: Config = { immediate: false, deep: false }) {
  const { immediate } = config;

  const prev = useRef<T>();
  const inited = useRef(false);
  const stop = useRef(false);

  useEffect(() => {
    const execute = () => callback(prev.current);

    if (!stop.current) {
      if (!inited.current) {
        inited.current = true;
        if (immediate) execute();
      } else execute();
      prev.current = dep;
    }
  }, [config.deep ? JSON.stringify(dep) : dep]);

  return () => {
    stop.current = true;
  };
}
