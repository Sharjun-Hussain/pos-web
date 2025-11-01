"use client";

import { SWRConfig } from "swr";

const fetcher = async (url, options = {}) => {
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.");
    error.info = await res.json().catch(() => null);
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function SWRProvider({ children }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0,
        errorRetryCount: 3,
      }}
    >
      {children}
    </SWRConfig>
  );
}
