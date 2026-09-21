import { useEffect, useState } from "react";
import { getCSRFToken, type MetaResponse } from "..";

let cache: MetaResponse | null = null;

export const useMeta = () => {
  const [meta, setMeta] = useState<MetaResponse | null>(cache);
  const [loading, setLoading] = useState(!cache);

  useEffect(() => {
    if (cache) return;

    const controller = new AbortController();

    fetch(import.meta.env.VITE_SURVEY_API_META, {
      credentials: "include",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken() || "",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Meta fetch failed: ${res.status}`);
        return res.json();
      })
      .then((data: MetaResponse) => {
        cache = data;
        setMeta(data);
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Failed to load meta:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, []);

  return { meta, loading };
};
