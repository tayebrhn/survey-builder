import { useEffect, useState } from "react";
import { getCSRFToken, type MetaResponse } from "..";

let cache: MetaResponse | null = null;

export const useMeta = () => {
  const [meta, setMeta] = useState<MetaResponse | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;
    fetch(import.meta.env.VITE_SURVEY_API_META, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken()!,
      },
    })
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
