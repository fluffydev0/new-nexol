import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Clock, CheckCircle2, XCircle, Lock, Unlock, TrendingUp, ExternalLink, Calendar, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useVaultPositions, calcYield, VaultPosition, LockType } from "@/hooks/useVaultPositions";
import { toast } from "sonner";

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function formatCountdown(ms: number) {
  if (ms <= 0) return "Unlocked";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

const lockLabels: Record<LockType, string> = { weekly: "Weekly Split", "3month": "3 Month", "6month": "6 Month", "1year": "1 Year" };
const lockColors: Record<LockType, string> = { weekly: "text-blue-400", "3month": "text-primary", "6month": "text-secondary", "1year": "text-yellow-400" };

export default function PaymentScheduler() {
  const [showForm, setShowForm] = useState(false);
  const { positions, depositWeeklySplit, depositLock, claimTranche, withdrawPosition } = useVaultPositions();
  const [now, setNow] = useState(Date.now());

  // Weekly split form
  const [weeklyForm, setWeeklyForm] = useState({ amount: "", weeks: "4" });
  // Lock form
  const [lockForm, setLockForm] = useState({ amount: "" });

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleWeeklyDeposit = () => {
    const amount = parseFloat(weeklyForm.amount);
    if (!amount || amount <= 0) return;
    depositWeeklySplit(amount, parseInt(weeklyForm.weeks));
    toast.success("Weekly split created!", { description: `$${amount.toFixed(2)} split into ${weeklyForm.weeks} weekly payments` });
    setWeeklyForm({ amount: "", weeks: "4" });
    setShowForm(false);
  };

  const handleLockDeposit = (lockType: "3month" | "6month" | "1year") => {
    const amount = parseFloat(lockForm.amount);
    if (!amount || amount <= 0) return;
    depositLock(amount, lockType);
    const apyMap = { "3month": "5.2%", "6month": "7.8%", "1year": "12.5%" };
    toast.success(`${lockLabels[lockType]} lock created!`, { description: `$${amount.toFixed(2)} locked at ${apyMap[lockType]} APY` });
    setLockForm({ amount: "" });
    setShowForm(false);
  };

  const handleClaim = (posId: string, idx: number) => {
    claimTranche(posId, idx);
    toast.success("Tranche claimed!");
  };

  const handleWithdraw = (posId: string) => {
    withdrawPosition(posId);
    toast.success("Position withdrawn! Principal + yield claimed.");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Payment Scheduler</h2>
          <p className="text-sm text-muted-foreground mt-1">Schedule payments & lock funds to earn yield</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 font-medium">Testnet Mode</span>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 rounded-xl">
            <Plus size={16} /> New Position
          </Button>
        </div>
      </div>

      {/* New Position Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="bg-card border border-border rounded-2xl p-6 overflow-hidden">
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-accent">
                <TabsTrigger value="weekly" className="text-xs sm:text-sm">Weekly Split</TabsTrigger>
                <TabsTrigger value="3month" className="text-xs sm:text-sm">3 Month</TabsTrigger>
                <TabsTrigger value="6month" className="text-xs sm:text-sm">6 Month</TabsTrigger>
                <TabsTrigger value="1year" className="text-xs sm:text-sm">1 Year</TabsTrigger>
              </TabsList>

              {/* WEEKLY SPLIT */}
              <TabsContent value="weekly" className="space-y-4 pt-4">
                <p className="text-sm text-muted-foreground">Split your USDT into weekly payments. No interest — pure scheduling.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Total Amount (USDT)</Label>
                    <Input type="number" placeholder="1000.00" value={weeklyForm.amount} onChange={(e) => setWeeklyForm({ ...weeklyForm, amount: e.target.value })} className="bg-accent border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Number of Weeks</Label>
                    <Input type="number" min="2" max="12" value={weeklyForm.weeks} onChange={(e) => setWeeklyForm({ ...weeklyForm, weeks: e.target.value })} className="bg-accent border-border" />
                  </div>
                </div>
                {weeklyForm.amount && (
                  <div className="bg-accent/50 rounded-lg p-3 text-sm text-muted-foreground">
                    Each week: <span className="text-foreground font-semibold">${(parseFloat(weeklyForm.amount || "0") / parseInt(weeklyForm.weeks || "4")).toFixed(2)} USDT</span>
                  </div>
                )}
                <div className="flex gap-3 justify-end">
                  <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  <Button onClick={handleWeeklyDeposit} disabled={!weeklyForm.amount}>Create Schedule</Button>
                </div>
              </TabsContent>

              {/* LOCK TIERS */}
              {(["3month", "6month", "1year"] as const).map((tier) => {
                const apyMap = { "3month": 5.2, "6month": 7.8, "1year": 12.5 };
                const daysMap = { "3month": 90, "6month": 180, "1year": 365 };
                const amt = parseFloat(lockForm.amount || "0");
                const projectedYield = (amt * apyMap[tier] * daysMap[tier]) / (100 * 365);
                return (
                  <TabsContent key={tier} value={tier} className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Lock USDT for {daysMap[tier]} days</p>
                      <span className="text-primary font-bold text-lg">{apyMap[tier]}% APY</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Amount (USDT)</Label>
                      <Input type="number" placeholder="1000.00" value={lockForm.amount} onChange={(e) => setLockForm({ amount: e.target.value })} className="bg-accent border-border" />
                    </div>
                    {amt > 0 && (
                      <div className="bg-accent/50 rounded-lg p-4 grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Projected Yield</p>
                          <p className="text-primary font-bold text-lg">+${projectedYield.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Final Balance</p>
                          <p className="text-foreground font-bold text-lg">${(amt + projectedYield).toFixed(2)}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex gap-3 justify-end">
                      <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                      <Button onClick={() => handleLockDeposit(tier)} disabled={!lockForm.amount}>Lock Funds</Button>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Positions */}
      {positions.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-12 text-center">
          <Timer className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold text-foreground mb-1">No Active Positions</h3>
          <p className="text-sm text-muted-foreground mb-4">Create a weekly split or lock funds to earn yield</p>
          <Button onClick={() => setShowForm(true)} className="gap-2"><Plus size={14} /> Create Position</Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {positions.map((pos) => (
            <PositionCard key={pos.id} position={pos} now={now} onClaimTranche={handleClaim} onWithdraw={handleWithdraw} />
          ))}
        </div>
      )}
    </div>
  );
}

function PositionCard({ position: pos, now, onClaimTranche, onWithdraw }: {
  position: VaultPosition; now: number;
  onClaimTranche: (id: string, idx: number) => void;
  onWithdraw: (id: string) => void;
}) {
  const elapsed = now - pos.lockedAt;
  const total = pos.unlockAt - pos.lockedAt;
  const progress = Math.min(100, (elapsed / total) * 100);
  const isUnlocked = now >= pos.unlockAt;
  const currentYield = pos.apyBps > 0 ? calcYield(pos.amount, pos.apyBps, pos.lockedAt, Math.min(now, pos.unlockAt)) : 0;

  const statusBadge = pos.claimed
    ? { label: "Claimed", class: "bg-muted/50 text-muted-foreground" }
    : isUnlocked
    ? { label: "Unlocked", class: "bg-primary/20 text-primary" }
    : { label: "Locked", class: "bg-yellow-500/20 text-yellow-400" };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-accent ${lockColors[pos.lockType]}`}>
            {pos.lockType === "weekly" ? <Calendar size={18} /> : <Lock size={18} />}
          </div>
          <div>
            <h4 className="font-semibold text-foreground">{lockLabels[pos.lockType]}</h4>
            <p className="text-xs text-muted-foreground">{formatDate(pos.lockedAt)} → {formatDate(pos.unlockAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge.class}`}>
            {!pos.claimed && isUnlocked && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-1 animate-pulse" />}
            {statusBadge.label}
          </span>
          {pos.apyBps > 0 && <span className="text-xs text-primary font-medium">{(pos.apyBps / 100).toFixed(1)}% APY</span>}
        </div>
      </div>

      {/* Amount & Yield */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Principal</p>
          <p className="text-foreground font-bold">${pos.amount.toFixed(2)}</p>
        </div>
        {pos.apyBps > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Yield Earned</p>
            <p className="text-primary font-bold">+${currentYield.toFixed(4)}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Time Left</p>
          <p className="text-foreground font-medium text-sm">{formatCountdown(pos.unlockAt - now)}</p>
        </div>
        {pos.apyBps > 0 && (
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-foreground font-bold">${(pos.amount + currentYield).toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{progress.toFixed(1)}% complete</span>
          <span>{formatCountdown(Math.max(0, pos.unlockAt - now))}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Weekly tranches */}
      {pos.lockType === "weekly" && pos.tranches && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">Payment Tranches</p>
          <div className="grid gap-2">
            {pos.tranches.map((t, i) => {
              const tUnlocked = now >= t.unlockAt;
              return (
                <div key={i} className="flex items-center justify-between bg-accent/50 rounded-lg px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    {t.claimed ? (
                      <CheckCircle2 size={14} className="text-muted-foreground" />
                    ) : tUnlocked ? (
                      <Unlock size={14} className="text-primary" />
                    ) : (
                      <Lock size={14} className="text-yellow-400" />
                    )}
                    <span className="text-sm text-foreground">Week {i + 1}: ${t.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{formatDate(t.unlockAt)}</span>
                    {t.claimed ? (
                      <span className="text-xs text-muted-foreground">Claimed</span>
                    ) : tUnlocked ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs text-primary border-primary/30 hover:bg-primary/10" onClick={() => onClaimTranche(pos.id, i)}>
                        Claim
                      </Button>
                    ) : (
                      <span className="text-xs text-yellow-400">{formatCountdown(t.unlockAt - now)}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Withdraw button for lock positions */}
      {pos.lockType !== "weekly" && !pos.claimed && (
        <div className="flex items-center justify-between pt-2">
          {pos.txHash && (
            <a href={`https://basescan.org/tx/${pos.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
              View on Basescan <ExternalLink size={12} />
            </a>
          )}
          <Button onClick={() => onWithdraw(pos.id)} disabled={!isUnlocked} className={`ml-auto gap-2 ${isUnlocked ? "bg-primary text-primary-foreground" : ""}`}>
            {isUnlocked ? <><Unlock size={14} /> Claim Principal + Yield</> : <><Lock size={14} /> Locked</>}
          </Button>
        </div>
      )}
    </motion.div>
  );
}
