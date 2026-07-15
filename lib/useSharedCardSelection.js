"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";

function cardsEqual(a = [], b = []) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  return sa.every((v, i) => v === sb[i]);
}

/**
 * Syncs bingo card selections across Cashier + FloorGuy for one shop.
 * Uses Mongo-backed API + short polling (~500ms).
 */
export function useSharedCardSelection({
  shopId,
  enabled = true,
  pollMs = 500,
  onRemoteChange,
}) {
  const [locked, setLocked] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const lastUpdatedAtRef = useRef(null);
  const ignoreUntilRef = useRef(0);
  const onRemoteChangeRef = useRef(onRemoteChange);
  onRemoteChangeRef.current = onRemoteChange;

  const applyRemote = useCallback((data) => {
    if (!data) return;
    const remoteAt = data.updatedAt ? new Date(data.updatedAt).getTime() : 0;
    if (Date.now() < ignoreUntilRef.current) {
      setLocked(!!data.locked);
      return;
    }
    if (
      lastUpdatedAtRef.current &&
      remoteAt &&
      remoteAt <= lastUpdatedAtRef.current
    ) {
      setLocked(!!data.locked);
      return;
    }
    lastUpdatedAtRef.current = remoteAt || Date.now();
    setLocked(!!data.locked);
    onRemoteChangeRef.current?.(data.selectedCards || [], !!data.locked);
  }, []);

  const fetchSelection = useCallback(async () => {
    if (!shopId || !enabled) return null;
    try {
      const { data } = await axios.get(`/api/card-selection`, {
        params: { shopId },
      });
      applyRemote(data);
      return data;
    } catch (err) {
      console.error("fetchSelection:", err);
      return null;
    }
  }, [shopId, enabled, applyRemote]);

  useEffect(() => {
    if (!shopId || !enabled) return;
    fetchSelection();
    const id = setInterval(fetchSelection, pollMs);
    return () => clearInterval(id);
  }, [shopId, enabled, pollMs, fetchSelection]);

  const patch = useCallback(
    async (payload) => {
      if (!shopId) return null;
      setSyncing(true);
      try {
        const { data } = await axios.patch("/api/card-selection", {
          shopId,
          ...payload,
        });
        ignoreUntilRef.current = Date.now() + 600;
        lastUpdatedAtRef.current = data.updatedAt
          ? new Date(data.updatedAt).getTime()
          : Date.now();
        setLocked(!!data.locked);
        return data;
      } catch (err) {
        console.error("card-selection patch:", err);
        throw err;
      } finally {
        setSyncing(false);
      }
    },
    [shopId],
  );

  const toggleCard = useCallback(
    async (cardNumber) => {
      const data = await patch({ action: "toggle", cardNumber });
      return data;
    },
    [patch],
  );

  const setCards = useCallback(
    async (selectedCards) => {
      return patch({ action: "set", selectedCards });
    },
    [patch],
  );

  const clearCards = useCallback(async () => {
    return patch({ action: "clear" });
  }, [patch]);

  const lockSelection = useCallback(async () => {
    return patch({ action: "lock" });
  }, [patch]);

  const unlockSelection = useCallback(
    async ({ clear = false } = {}) => {
      return patch({ action: "unlock", clear });
    },
    [patch],
  );

  return {
    locked,
    syncing,
    fetchSelection,
    toggleCard,
    setCards,
    clearCards,
    lockSelection,
    unlockSelection,
    cardsEqual,
  };
}
