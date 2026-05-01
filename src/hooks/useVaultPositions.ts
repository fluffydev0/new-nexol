import { useState, useEffect, useCallback } from "react";

export type LockType = "weekly" | "3month" | "6month" | "1year";
export type PositionStatus = "locked" | "unlocked" | "claimed" | "partial";

export interface WeeklyTranche {
  amount: number;
  unlockAt: number;
  claimed: boolean;
}

export interface VaultPosition {
  id: string;
  lockType: LockType;
  amount: number;
  lockedAt: number;
  unlockAt: number;
  apyBps: number;
  status: PositionStatus;
  tranches?: WeeklyTranche[];
  claimed: boolean;
  txHash?: string;
}

const LOCK_CONFIG: Record<Exclude<LockType, "weekly">, { days: number; apyBps: number; label: string }> = {
  "3month": { days: 90, apyBps: 520, label: "3 Month" },
  "6month": { days: 180, apyBps: 780, label: "6 Month" },
  "1year": { days: 365, apyBps: 1250, label: "1 Year" },
};

const STORAGE_KEY = "nexolpay_vault_positions";

function loadPositions(): VaultPosition[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function savePositions(positions: VaultPosition[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(positions));
}

export function calcYield(amount: number, apyBps: number, lockedAt: number, now: number): number {
  const elapsed = Math.max(0, now - lockedAt);
  const yearMs = 365 * 24 * 60 * 60 * 1000;
  return (amount * apyBps * elapsed) / (10000 * yearMs);
}

export function useVaultPositions() {
  const [positions, setPositions] = useState<VaultPosition[]>(loadPositions);

  useEffect(() => {
    savePositions(positions);
  }, [positions]);

  const depositWeeklySplit = useCallback((totalAmount: number, weeks: number = 4) => {
    const weeklyAmount = totalAmount / weeks;
    const now = Date.now();
    const tranches: WeeklyTranche[] = Array.from({ length: weeks }, (_, i) => ({
      amount: weeklyAmount,
      unlockAt: now + (i + 1) * 7 * 24 * 60 * 60 * 1000,
      claimed: false,
    }));
    const position: VaultPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      lockType: "weekly",
      amount: totalAmount,
      lockedAt: now,
      unlockAt: tranches[tranches.length - 1].unlockAt,
      apyBps: 0,
      status: "locked",
      tranches,
      claimed: false,
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    };
    setPositions((prev) => [position, ...prev]);
    return position;
  }, []);

  const depositLock = useCallback((amount: number, lockType: Exclude<LockType, "weekly">) => {
    const cfg = LOCK_CONFIG[lockType];
    const now = Date.now();
    const position: VaultPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      lockType,
      amount,
      lockedAt: now,
      unlockAt: now + cfg.days * 24 * 60 * 60 * 1000,
      apyBps: cfg.apyBps,
      status: "locked",
      claimed: false,
      txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    };
    setPositions((prev) => [position, ...prev]);
    return position;
  }, []);

  const claimTranche = useCallback((positionId: string, trancheIndex: number) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== positionId || !p.tranches) return p;
        const tranches = p.tranches.map((t, i) =>
          i === trancheIndex && Date.now() >= t.unlockAt ? { ...t, claimed: true } : t
        );
        const allClaimed = tranches.every((t) => t.claimed);
        return { ...p, tranches, status: allClaimed ? "claimed" : "partial", claimed: allClaimed };
      })
    );
  }, []);

  const withdrawPosition = useCallback((positionId: string) => {
    setPositions((prev) =>
      prev.map((p) => {
        if (p.id !== positionId || Date.now() < p.unlockAt) return p;
        return { ...p, status: "claimed", claimed: true };
      })
    );
  }, []);

  return { positions, depositWeeklySplit, depositLock, claimTranche, withdrawPosition };
}
