"use client";
import { useState, useEffect } from 'react';

export function useStore() {
  const [state, setState] = useState(null);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const res = await fetch('/api/state', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setState(data);
        }
      } catch (e) {
        console.error("Failed to fetch state:", e);
      }
    };
    
    fetchState();
    const interval = setInterval(fetchState, 1500); // 輪詢以模擬即時資料庫
    return () => clearInterval(interval);
  }, []);

  const dispatch = async (action, payload) => {
    try {
      await fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload })
      });
    } catch (e) {
      console.error("Failed to dispatch action:", e);
    }
  };

  return { state, dispatch };
}
