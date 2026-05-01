import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield, Check, X, Clock, DollarSign, Eye, EyeOff,
  RefreshCw, LogOut, Loader2, Gift, Copy, Download, Lock,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface Redemption {
  id: string;
  user_id: string;
  user_email: string | null;
  reference_number: string;
  brand: string;
  card_currency: string;
  card_value: number;
  card_code: string;
  card_pin: string | null;
  commission_rate: number;
  commission_amount: number;
  usdt_payout: number;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  actioned_at: string | null;
  actioned_by: string | null;
  tx_hash: string | null;
}

const REJECTION_REASONS = [
  "Card already redeemed / $0 balance",
  "Invalid card code — does not exist",
  "Card region not supported",
  "Card has been flagged for fraud",
  "Duplicate submission",
];

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const REMEMBER_KEY = "nexol_admin_remember";

export default function AdminGiftCards() {
  const { user, loading, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [showCodes, setShowCodes] = useState<Record<string, boolean>>({});

  // Admin login form
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);

  // Approve modal
  const [approveTarget, setApproveTarget] = useState<Redemption | null>(null);
  const [approving, setApproving] = useState(false);

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState<Redemption | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Session timeout
  useEffect(() => {
    if (!user || !isAdmin) return;
    const remembered = localStorage.getItem(REMEMBER_KEY) === "true";
    if (remembered) return; // no timeout for remembered sessions

    const timeout = setTimeout(() => {
      toast.info("Session expired — please sign in again");
      signOut();
    }, SESSION_TIMEOUT_MS);

    const resetTimeout = () => {
      clearTimeout(timeout);
    };
    const events = ["mousedown", "keydown", "scroll", "touchstart"];
    // We only set one timeout; for activity-based reset we'd need more logic
    // Keeping it simple: hard 30-min timeout unless "remember me"
    return () => {
      clearTimeout(timeout);
      events.forEach((e) => window.removeEventListener(e, resetTimeout));
    };
  }, [user, isAdmin, signOut]);

  useEffect(() => {
    if (!user) return;
    checkAdmin();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
      // Realtime for new submissions
      const channel = supabase
        .channel("admin-redemptions")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "gift_card_redemptions" },
          () => fetchData()
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [isAdmin]);

  async function checkAdmin() {
    const { data } = await supabase.rpc("has_role", {
      _user_id: user!.id,
      _role: "admin",
    });
    setIsAdmin(!!data);
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    });
    if (error) {
      toast.error("Invalid credentials");
    } else if (rememberMe) {
      localStorage.setItem(REMEMBER_KEY, "true");
    } else {
      localStorage.removeItem(REMEMBER_KEY);
    }
    setLoginLoading(false);
  }

  async function fetchData() {
    setLoadingData(true);
    const { data } = await supabase
      .from("gift_card_redemptions")
      .select("*")
      .order("submitted_at", { ascending: false });
    if (data) setRedemptions(data as unknown as Redemption[]);
    setLoadingData(false);
  }

  async function handleApprove() {
    if (!approveTarget || !user) return;
    setApproving(true);

    // Update redemption status
    await supabase
      .from("gift_card_redemptions")
      .update({
        status: "approved",
        actioned_at: new Date().toISOString(),
        actioned_by: user.id,
      })
      .eq("id", approveTarget.id);

    // Credit user wallet
    const { data: wallet } = await supabase
      .from("user_wallets")
      .select("usdc_balance")
      .eq("user_id", approveTarget.user_id)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from("user_wallets")
        .update({ usdc_balance: Number(wallet.usdc_balance) + approveTarget.usdt_payout })
        .eq("user_id", approveTarget.user_id);
    }

    toast.success(`Approved — $${approveTarget.usdt_payout.toFixed(2)} USDT released`);
    setApproving(false);
    setApproveTarget(null);
    fetchData();
  }

  async function handleReject() {
    if (!rejectTarget || !user) return;
    setRejecting(true);
    const reason = rejectReason === "custom" ? customReason : rejectReason;

    await supabase
      .from("gift_card_redemptions")
      .update({
        status: "rejected",
        rejection_reason: reason,
        actioned_at: new Date().toISOString(),
        actioned_by: user.id,
      })
      .eq("id", rejectTarget.id);

    toast.success("Redemption rejected");
    setRejecting(false);
    setRejectTarget(null);
    setRejectReason("");
    setCustomReason("");
    fetchData();
  }

  function maskEmail(email: string | null) {
    if (!email) return "—";
    const [local, domain] = email.split("@");
    return `${local.slice(0, 3)}***@${domain}`;
  }

  function timeSince(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  }

  if (loading || (user && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    const showLogin = !user || (isAdmin === false);
    const accessDenied = user && isAdmin === false;
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1" />
        <div className="max-w-sm mx-auto w-full px-4 pb-16">
          <Card className="border-border">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <Shield className={`mx-auto mb-3 ${accessDenied ? "text-destructive" : "text-primary"}`} size={40} />
                <h2 className="font-display font-bold text-xl text-foreground mb-1">
                  {accessDenied ? "Access Denied" : "Admin Login"}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {accessDenied
                    ? "This account doesn't have admin privileges."
                    : "Sign in with your admin credentials"}
                </p>
              </div>
              {accessDenied ? (
                <Button variant="outline" className="w-full" onClick={signOut}>
                  <LogOut size={14} className="mr-2" /> Sign out & try another account
                </Button>
              ) : (
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email" className="text-foreground">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@nexolpay.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      required
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-pass" className="text-foreground">Password</Label>
                    <Input
                      id="admin-pass"
                      type="password"
                      placeholder="••••••••"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      required
                      className="bg-muted border-border"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember-me"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked === true)}
                    />
                    <Label htmlFor="remember-me" className="text-xs text-muted-foreground cursor-pointer">
                      Remember me (skip 30-min timeout)
                    </Label>
                  </div>
                  <Button type="submit" disabled={loginLoading} className="w-full">
                    {loginLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Lock size={14} className="mr-2" />}
                    Sign In
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
          <p className="text-center text-xs text-muted-foreground mt-4">NexolPay Super Admin Panel</p>
        </div>
      </div>
    );
  }

  const pending = redemptions.filter((r) => r.status === "pending");
  const completed = redemptions.filter((r) => r.status !== "pending");
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const todayRedemptions = redemptions.filter((r) => new Date(r.submitted_at) >= todayStart);
  const todayVolume = todayRedemptions.filter((r) => r.status === "approved").reduce((s, r) => s + r.usdt_payout, 0);
  const todayCommission = todayRedemptions.filter((r) => r.status === "approved").reduce((s, r) => s + r.commission_amount, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary" />
          <h1 className="font-display font-bold text-lg text-foreground">Gift Card Admin</h1>
          <Badge variant="outline" className="text-xs border-primary/30 text-primary">Super Admin</Badge>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Pending", value: pending.length, icon: Clock, color: "text-amber-400" },
            { label: "Total Today", value: todayRedemptions.length, icon: Gift, color: "text-blue-400" },
            { label: "Volume Today", value: `$${todayVolume.toFixed(2)}`, icon: DollarSign, color: "text-primary" },
            { label: "Commission Today", value: `$${todayCommission.toFixed(2)}`, icon: DollarSign, color: "text-secondary" },
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

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">
              Pending Queue {pending.length > 0 && <Badge className="ml-2 bg-amber-500/20 text-amber-400 text-xs">{pending.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="mt-4">
            {loadingData ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : pending.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No pending redemptions</div>
            ) : (
              <div className="space-y-4">
                {pending.map((r) => (
                  <Card key={r.id} className="border-amber-500/20">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between flex-wrap gap-3">
                        <div>
                          <p className="font-semibold text-sm text-foreground capitalize">{r.brand} Gift Card</p>
                          <p className="text-xs text-muted-foreground font-mono">{r.reference_number}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5" />
                            Pending
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{timeSince(r.submitted_at)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">User</p>
                          <p className="text-foreground text-xs">{maskEmail(r.user_email)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Card Value</p>
                          <p className="text-foreground font-semibold">${r.card_value} {r.card_currency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">USDT to Release</p>
                          <p className="text-primary font-semibold">${r.usdt_payout.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Commission</p>
                          <p className="text-secondary font-semibold">${r.commission_amount.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Card Code</p>
                          <div className="flex items-center gap-2">
                            <code className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded">
                              {showCodes[r.id] ? r.card_code : "••••-••••-••••-••••"}
                            </code>
                            <button onClick={() => setShowCodes((p) => ({ ...p, [r.id]: !p[r.id] }))} className="text-muted-foreground hover:text-foreground">
                              {showCodes[r.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            {showCodes[r.id] && (
                              <button onClick={() => { navigator.clipboard.writeText(r.card_code); toast.success("Copied"); }} className="text-muted-foreground hover:text-foreground">
                                <Copy size={14} />
                              </button>
                            )}
                          </div>
                        </div>
                        {r.card_pin && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">PIN</p>
                            <code className="text-foreground font-mono text-xs bg-muted px-2 py-1 rounded">
                              {showCodes[r.id] ? r.card_pin : "••••"}
                            </code>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-border">
                        <Button size="sm" onClick={() => setApproveTarget(r)} className="bg-primary hover:bg-primary/90">
                          <Check size={14} className="mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => setRejectTarget(r)}>
                          <X size={14} className="mr-1" /> Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completed.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No completed redemptions</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground">Reference</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground">User</th>
                      <th className="text-left py-3 px-2 text-xs text-muted-foreground">Brand</th>
                      <th className="text-right py-3 px-2 text-xs text-muted-foreground">Value</th>
                      <th className="text-right py-3 px-2 text-xs text-muted-foreground">USDT</th>
                      <th className="text-right py-3 px-2 text-xs text-muted-foreground">Commission</th>
                      <th className="text-center py-3 px-2 text-xs text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((r) => (
                      <tr key={r.id} className="border-b border-border/50">
                        <td className="py-3 px-2 text-xs">{new Date(r.submitted_at).toLocaleDateString()}</td>
                        <td className="py-3 px-2 text-xs font-mono">{r.reference_number}</td>
                        <td className="py-3 px-2 text-xs">{maskEmail(r.user_email)}</td>
                        <td className="py-3 px-2 text-xs capitalize">{r.brand}</td>
                        <td className="py-3 px-2 text-xs text-right">${r.card_value}</td>
                        <td className="py-3 px-2 text-xs text-right text-primary">${r.usdt_payout.toFixed(2)}</td>
                        <td className="py-3 px-2 text-xs text-right">${r.commission_amount.toFixed(2)}</td>
                        <td className="py-3 px-2 text-center">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              r.status === "approved"
                                ? "border-primary/30 text-primary"
                                : "border-destructive/30 text-destructive"
                            }`}
                          >
                            {r.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Approve Modal */}
      <Dialog open={!!approveTarget} onOpenChange={() => setApproveTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Approval</DialogTitle>
            <DialogDescription>
              You are releasing <span className="text-primary font-semibold">${approveTarget?.usdt_payout.toFixed(2)} USDT</span> to user {maskEmail(approveTarget?.user_email || null)}
            </DialogDescription>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">
            Commission retained: <span className="text-secondary font-semibold">${approveTarget?.commission_amount.toFixed(2)}</span>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button onClick={handleApprove} disabled={approving} className="bg-primary hover:bg-primary/90">
              {approving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Check size={14} className="mr-1" />}
              Confirm Approval
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={!!rejectTarget} onOpenChange={() => { setRejectTarget(null); setRejectReason(""); setCustomReason(""); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Redemption</DialogTitle>
            <DialogDescription>
              Select a reason for rejecting {rejectTarget?.reference_number}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {REJECTION_REASONS.map((reason) => (
              <button
                key={reason}
                onClick={() => setRejectReason(reason)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                  rejectReason === reason ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground"
                }`}
              >
                {reason}
              </button>
            ))}
            <button
              onClick={() => setRejectReason("custom")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-all ${
                rejectReason === "custom" ? "border-destructive bg-destructive/10 text-destructive" : "border-border text-muted-foreground"
              }`}
            >
              Custom reason...
            </button>
            {rejectReason === "custom" && (
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Enter custom reason"
                className="w-full bg-card border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-destructive"
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejecting || (!rejectReason || (rejectReason === "custom" && !customReason.trim()))}
            >
              {rejecting ? <Loader2 size={14} className="animate-spin mr-1" /> : <X size={14} className="mr-1" />}
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
