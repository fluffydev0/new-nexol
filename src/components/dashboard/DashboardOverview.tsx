import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Gift, Calendar, Lock, Calculator, TrendingUp, Wallet, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const quickActions = [
  { title: "Redeem Gift Card", desc: "Amazon & Apple → USDC", icon: Gift, href: "/dashboard/redeem", color: "text-secondary" },
  { title: "Schedule Payment", desc: "One-time or recurring", icon: Calendar, href: "/dashboard/scheduler", color: "text-blue-400" },
  { title: "Vault Deposit", desc: "Earn up to 10% APY", icon: Lock, href: "/dashboard/vault", color: "text-primary" },
  { title: "Yield Calculator", desc: "Estimate your earnings", icon: Calculator, href: "/dashboard/calculator", color: "text-yellow-400" },
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [totalLocked, setTotalLocked] = useState<number>(0);
  const [totalEarned, setTotalEarned] = useState<number>(0);
  const [pendingRedemptions, setPendingRedemptions] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  async function fetchData() {
    setLoading(true);
    const [{ data: wallet }, { data: deposits }, { data: submissions }] = await Promise.all([
      supabase.from("user_wallets").select("usdc_balance").eq("user_id", user!.id).maybeSingle(),
      supabase.from("vault_deposits").select("amount, apy_rate, locked_at, unlock_at, status").eq("user_id", user!.id),
      supabase.from("gift_card_submissions").select("status").eq("user_id", user!.id).eq("status", "pending"),
    ]);

    setWalletBalance(wallet?.usdc_balance ? Number(wallet.usdc_balance) : 0);
    setPendingRedemptions(submissions?.length || 0);

    if (deposits) {
      const locked = deposits.filter((d) => d.status === "active").reduce((s, d) => s + Number(d.amount), 0);
      setTotalLocked(locked);

      const earned = deposits.reduce((s, d) => {
        const days = Math.max(0, (Date.now() - new Date(d.locked_at).getTime()) / 86400000);
        return s + (Number(d.amount) * Number(d.apy_rate) / 100) * (days / 365);
      }, 0);
      setTotalEarned(earned);
    }
    setLoading(false);
  }

  const stats = [
    { label: "Wallet Balance", value: `$${walletBalance.toFixed(2)}`, sub: "USDC", icon: Wallet },
    { label: "Total Locked", value: `$${totalLocked.toFixed(2)}`, sub: "in Vault", icon: Lock },
    { label: "Total Earned", value: `$${totalEarned.toFixed(2)}`, sub: "yield", icon: TrendingUp },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Welcome back 👋</h2>
        <p className="text-sm text-muted-foreground mt-1">Here's your NexolPay overview</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <s.icon size={16} className="text-muted-foreground" />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </motion.div>
            ))}
          </div>

          {pendingRedemptions > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-400"
            >
              ⏳ You have {pendingRedemptions} gift card{pendingRedemptions > 1 ? "s" : ""} pending review
            </motion.div>
          )}
        </>
      )}

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((a, i) => (
            <motion.div
              key={a.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <Link
                to={a.href}
                className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4 hover:border-muted-foreground/30 transition-colors group block"
              >
                <div className={`w-11 h-11 rounded-xl bg-accent flex items-center justify-center shrink-0 ${a.color}`}>
                  <a.icon size={20} />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-foreground">{a.title}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
