import { useState, useCallback, useEffect } from "react";
import type { ScanResult } from "./useSkillGeneration";

export interface HistoryEntry {
  id: string;
  description: string;
  skillName: string;
  skillMd: string;
  scanScore: number;
  riskLevel: string;
  scanResult: ScanResult | null;
  createdAt: number;
}

const STORAGE_KEY = "skillforge_history";
const MAX_ENTRIES = 20;

function loadEntries(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveEntries(entries: HistoryEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function useHistory() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadEntries);

  // Sync to localStorage on every change
  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const addEntry = useCallback((entry: Omit<HistoryEntry, "id" | "createdAt">) => {
    setEntries((prev) => {
      const newEntry: HistoryEntry = {
        ...entry,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };
      const next = [newEntry, ...prev];
      if (next.length > MAX_ENTRIES) {
        next.length = MAX_ENTRIES;
      }
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setEntries([]);
  }, []);

  return { entries, addEntry, removeEntry, clearAll };
}
