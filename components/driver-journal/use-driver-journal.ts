"use client";

import { useEffect, useState } from "react";

import {
  defaultDriverJournalStore,
  DRIVER_JOURNAL_STORAGE_KEY,
  type DriverJournalStore,
} from "@/lib/driver-journal";

export function useDriverJournal() {
  const [store, setStore] = useState<DriverJournalStore>(defaultDriverJournalStore);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DRIVER_JOURNAL_STORAGE_KEY);
      if (!raw) {
        setLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<DriverJournalStore>;
      setStore({
        activeJourney: parsed.activeJourney ?? null,
        closures: parsed.closures ?? [],
        fuelEntries: parsed.fuelEntries ?? [],
        maintenanceEntries: parsed.maintenanceEntries ?? [],
      });
    } catch {
      setStore(defaultDriverJournalStore);
    } finally {
      setLoaded(true);
    }
  }, []);

  function updateStore(nextStore: DriverJournalStore) {
    setStore(nextStore);
    window.localStorage.setItem(DRIVER_JOURNAL_STORAGE_KEY, JSON.stringify(nextStore));
  }

  return { store, loaded, updateStore };
}
