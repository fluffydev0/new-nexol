import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Eye,
  EyeOff,
  Check,
  X,
  Clock,
  DollarSign,
  Users,
  Gift,
  LogOut,
  RefreshCw,
  CreditCard,
  Apple,
  Loader2,
} from "lucide-react";

interface Submission {
  id: string;
  user_id: string;
  card_type: string;
  card_code: string;
  card_pin: string | null;
  card_amount: number;
  service_fee: number;
  usdc_payout: number;
  status: string;
  admin_notes: string | null;
  created_at: string;
  profiles?: { display_name: string | null } | null;
}

interface WalletInfo {
  id: string;
  user_id: string;
  usdc_balance: number;
  profiles?: { display_name: string | null } | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  processing: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  approved: "bg-primary/20 text-primary border-primary/30",
  rejected: "bg-destructive/20 text-destructive border-destructive/30",
};

export default function AdminDashboard() {
  const { user, loading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  async function checkAdmin() {
    const { data } = await supabase.rpc("has_role", {
      _user_id: user!.id,
      _role: "admin",
    });
    setIsAdmin(!!data);
  }

  async function fetchData() {
    setLoadingData(true);
    const [{ data: subs }, { data: wals }] = await Promise.all([
      supabase
        .from("gift_card_submissions")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("user_wallets")
        .select("*"),
    ]);
    setSubmissions((subs as Submission[]) || []);
    setWallets((wals as WalletInfo[]) || []);
    setLoadingData(false);
  }

  async function handleAction(submissionId: string, action: "approved" | "rejected") {
    setProcessingId(submissionId);
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;

    // Update submission status
    await supabase
      .from("gift_card_submissions")
      .update({
        status: action,
        admin_notes: adminNotes[submissionId] || null,
        reviewed_by: user!.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", submissionId);

    // If approved, credit the user's wallet
    if (action === "approved") {
      const wallet = wallets.find((w) => w.user_id === sub.user_id);
      if (wallet) {
        await supabase
          .from("user_wallets")
          .update({ usdc_balance: wallet.usdc_balance + sub.usdc_payout })
          .eq("user_id", sub.user_id);
      }
    }

    setProcessingId(null);
    fetchData();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  if (isAdmin === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="mx-auto mb-4 text-destructive" size={48} />
            <h2 className="font-display font-bold text-xl text-foreground mb-2">Access Denied</h2>
            <p className="text-sm text-muted-foreground">You don't have admin privileges.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingCount = submissions.filter((s) => s.status === "pending").length;
  const totalPayout = submissions
    .filter((s) => s.status === "approved")
    .reduce((sum, s) => sum + s.usdc_payout, 0);
  const totalUsers = wallets.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">NexolPay Admin</h1>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">
            Super Admin
          </Badge>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={fetchData}>
            <RefreshCw size={14} className="mr-1" /> Refresh
          </Button>
          <Button variant="ghost" size="icon" onClick={signOut}>
            <LogOut size={16} />
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { label: "Pending Reviews", value: pendingCount, icon: Clock, color: "text-yellow-400" },
            { label: "Total Approved Payouts", value: `$${totalPayout.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
            { label: "Total Users", value: totalUsers, icon: Users, color: "text-blue-400" },
            { label: "Total Submissions", value: submissions.length, icon: Gift, color: "text-secondary" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">{s.label}</span>
                  <s.icon size={16} className={s.color} />
                </div>
                <p className="font-display font-bold text-2xl text-foreground">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submissions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gift Card Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : submissions.length === 0 ? (
              <p className="text-center text-muted-foreground py-12">No submissions yet</p>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {submissions.map((sub) => (
                    <motion.div
                      key={sub.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-border rounded-xl p-5 space-y-4"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          {sub.card_type === "amazon" ? (
                            <CreditCard size={20} className="text-yellow-400" />
                          ) : (
                            <Apple size={20} className="text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-semibold text-sm text-foreground capitalize">
                              {sub.card_type} Gift Card
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(sub.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs px-3 py-1 rounded-full border ${STATUS_COLORS[sub.status]}`}>
                          {sub.status}
                        </span>
                      </div>

                      {/* Card Details */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Card Code</p>
                          <div className="flex items-center gap-2">
                            <code className="text-foreground font-mono text-xs">
                              {showCodes[sub.id] ? sub.card_code : "••••-••••-••••"}
                            </code>
                            <button
                              onClick={() =>
                                setShowCodes((prev) => ({ ...prev, [sub.id]: !prev[sub.id] }))
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {showCodes[sub.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>
                        </div>
                        {sub.card_pin && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">PIN</p>
                            <code className="text-foreground font-mono text-xs">
                              {showCodes[sub.id] ? sub.card_pin : "••••"}
                            </code>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Card Value</p>
                          <p className="text-foreground font-semibold">${sub.card_amount}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">USDC Payout</p>
                          <p className="text-primary font-semibold">${sub.usdc_payout}</p>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        User ID: <code className="font-mono">{sub.user_id.slice(0, 8)}...</code>
                      </div>

                      {/* Admin Actions */}
                      {sub.status === "pending" && (
                        <div className="space-y-3 pt-2 border-t border-border">
                          <textarea
                            placeholder="Admin notes (optional)..."
                            value={adminNotes[sub.id] || ""}
                            onChange={(e) =>
                              setAdminNotes((prev) => ({ ...prev, [sub.id]: e.target.value }))
                            }
                            className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground resize-none h-16 outline-none focus:border-primary/50"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAction(sub.id, "approved")}
                              disabled={processingId === sub.id}
                              className="bg-primary hover:bg-primary/90"
                            >
                              {processingId === sub.id ? (
                                <Loader2 size={14} className="animate-spin mr-1" />
                              ) : (
                                <Check size={14} className="mr-1" />
                              )}
                              Approve & Release USDC
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(sub.id, "rejected")}
                              disabled={processingId === sub.id}
                            >
                              <X size={14} className="mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      )}

                      {sub.admin_notes && sub.status !== "pending" && (
                        <p className="text-xs text-muted-foreground italic border-t border-border pt-3">
                          Admin note: {sub.admin_notes}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </CardContent>
        </Card>

        {/* User Wallets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">User Wallets</CardTitle>
          </CardHeader>
          <CardContent>
            {wallets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No wallets yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground font-medium">User ID</th>
                      <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">USDC Balance</th>
                      <th className="text-right py-3 px-2 text-xs text-muted-foreground font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wallets.map((w) => (
                      <tr key={w.id} className="border-b border-border/50">
                        <td className="py-3 px-2">
                          <code className="text-xs font-mono text-foreground">{w.user_id.slice(0, 12)}...</code>
                        </td>
                        <td className="py-3 px-2 text-right font-semibold text-primary">
                          ${Number(w.usdc_balance).toFixed(2)}
                        </td>
                        <td className="py-3 px-2 text-right text-xs text-muted-foreground">—</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
