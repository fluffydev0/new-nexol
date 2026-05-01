import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type LockDuration = "7d" | "3m" | "6m" | "1y";

interface LockOption {
  key: LockDuration;
  label: string;
  days: number;
  apy: number;
}

const lockOptions: LockOption[] = [
  { key: "7d", label: "7 Days", days: 7, apy: 0 },
  { key: "3m", label: "3 Months", days: 90, apy: 6 },
  { key: "6m", label: "6 Months", days: 180, apy: 8 },
  { key: "1y", label: "12 Months", days: 365, apy: 10 },
];

interface VaultDeposit {
  id: string;
  amount: number;
  lock_duration: string;
  apy_rate: number;
  locked_at: string;
  unlock_at: string;
  status: string;
}

function CountdownTimer({ unlockAt }: { unlockAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(unlockAt).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Unlocked!");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${days}d ${hours}h ${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [unlockAt]);

  return <span className="font-mono text-sm text-foreground">{timeLeft}</span>;
}

export default function VaultFeature() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<VaultDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<LockDuration>("3m");

  const selectedOption = lockOptions.find((o) => o.key === selected)!;
  const estimatedEarnings = amount
    ? (parseFloat(amount) * selectedOption.apy / 100) * (selectedOption.days / 365)
    : 0;

  const totalLocked = deposits
    .filter((d) => d.status === "active")
    .reduce((acc, d) => acc + d.amount, 0);

  // Fetch deposits
  useEffect(() => {
    if (!user) return;
    const fetchDeposits = async () => {
      const { data, error } = await supabase
        .from("vault_deposits")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching deposits:", error);
      } else {
        setDeposits(data || []);
      }
      setLoading(false);
    };
    fetchDeposits();
  }, [user]);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0 || !user) return;

    const now = new Date();
    const unlockAt = new Date(now.getTime() + selectedOption.days * 24 * 60 * 60 * 1000);

    const { data, error } = await supabase
      .from("vault_deposits")
      .insert({
        user_id: user.id,
        amount: parseFloat(amount),
        lock_duration: selectedOption.key,
        apy_rate: selectedOption.apy,
        locked_at: now.toISOString(),
        unlock_at: unlockAt.toISOString(),
      })
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setDeposits([data, ...deposits]);
    setAmount("");
    setShowDeposit(false);
    toast({ title: "Vault Created", description: `$${parseFloat(amount).toLocaleString()} locked for ${selectedOption.label}` });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display font-bold text-2xl text-foreground">Vault</h2>
          <p className="text-sm text-muted-foreground mt-1">Lock funds to earn yield on your savings</p>
        </div>
        <Button onClick={() => setShowDeposit(!showDeposit)} className="gap-2 rounded-xl">
          <Lock size={16} /> New Deposit
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Total Locked</p>
          <p className="font-display font-bold text-2xl text-foreground">${totalLocked.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Active Vaults</p>
          <p className="font-display font-bold text-2xl text-foreground">
            {deposits.filter((d) => d.status === "active").length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Best APY</p>
          <p className="font-display font-bold text-2xl text-primary">10%</p>
        </div>
      </div>

      {/* Deposit Form */}
      <AnimatePresence>
        {showDeposit && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-5"
          >
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Amount (USDC)</label>
              <Input
                type="number"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-accent border-border text-lg h-12"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Lock Duration</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {lockOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setSelected(opt.key)}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      selected === opt.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-accent text-muted-foreground hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-semibold text-sm">{opt.label}</p>
                    <p className={`text-xs mt-0.5 ${opt.apy === 0 ? "text-muted-foreground" : "text-primary"}`}>
                      {opt.apy === 0 ? "No interest" : `${opt.apy}% APY`}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-accent/50 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="text-xs text-muted-foreground">Estimated Earnings</p>
                  <p className="font-display font-bold text-lg text-primary">
                    +${estimatedEarnings.toFixed(2)} USDC
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Final Balance</p>
                  <p className="font-display font-bold text-lg text-foreground">
                    ${(parseFloat(amount) + estimatedEarnings).toFixed(2)}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeposit(false)}>Cancel</Button>
              <Button onClick={handleDeposit} disabled={!amount || parseFloat(amount) <= 0}>
                Lock Funds
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Vaults */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Active Vaults</h3>
        {deposits.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">No vault deposits yet. Create your first one!</p>
          </div>
        ) : (
          deposits.map((d, i) => {
            const lockedAt = new Date(d.locked_at).getTime();
            const unlockAt = new Date(d.unlock_at).getTime();
            const elapsed = Date.now() - lockedAt;
            const total = unlockAt - lockedAt;
            const progress = Math.min((elapsed / total) * 100, 100);
            const opt = lockOptions.find((o) => o.key === d.lock_duration);
            const days = opt?.days || 0;
            const earned = (d.amount * d.apy_rate / 100) * (days / 365) * (progress / 100);

            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-display font-bold text-xl text-foreground">
                      ${d.amount.toLocaleString()} USDC
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {opt?.label} lock • {d.apy_rate}% APY
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={14} />
                      <CountdownTimer unlockAt={d.unlock_at} />
                    </div>
                    <p className="text-xs text-primary mt-1">+${earned.toFixed(2)} earned</p>
                  </div>
                </div>
                <div className="w-full bg-accent rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full"
                  />
                </div>
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">Locked</span>
                  <span className="text-[10px] text-muted-foreground">{progress.toFixed(0)}%</span>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
