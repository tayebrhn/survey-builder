import { useEffect, useState } from "react";
import type { MetaResponse } from "../types/metaTypes";

let cache: MetaResponse | null = null;

export const useMeta = () => {
  const [meta, setMeta] = useState<MetaResponse | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetch("http://127.0.0.1:8000/api/meta/")
      .then((res) => res.json())
      .then((data: MetaResponse) => {
        cache = data;
        setMeta(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);
  return { meta, loading };
};
