import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Gift, ArrowLeft, ArrowRight, Check, X, Copy, Clock, Loader2,
  ExternalLink, Download, CreditCard, Gamepad2, Film, ShoppingCart,
  Smartphone, Monitor, Wallet,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import QRCode from "react-qr-code";

type FlowState = "select" | "details" | "confirm" | "pending" | "success" | "rejected";

interface Brand {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

const BRANDS: Brand[] = [
  { id: "amazon", name: "Amazon", icon: ShoppingCart, color: "text-yellow-400" },
  { id: "apple", name: "Apple", icon: Smartphone, color: "text-muted-foreground" },
  { id: "google_play", name: "Google Play", icon: Gamepad2, color: "text-green-400" },
  { id: "netflix", name: "Netflix", icon: Film, color: "text-red-400" },
  { id: "steam", name: "Steam", icon: Monitor, color: "text-blue-400" },
  { id: "xbox", name: "Xbox", icon: Gamepad2, color: "text-green-500" },
  { id: "visa", name: "Visa Gift Card", icon: CreditCard, color: "text-blue-300" },
  { id: "walmart", name: "Walmart", icon: ShoppingCart, color: "text-yellow-300" },
];

const CURRENCIES = ["USD", "GBP", "EUR", "CAD", "AUD"];
const DENOMINATIONS = ["10", "25", "50", "100", "150", "200", "250", "500", "custom"];
const COMMISSION_RATE = 0.30;

interface Redemption {
  id: string;
  reference_number: string;
  brand: string;
  card_currency: string;
  card_value: number;
  commission_amount: number;
  usdt_payout: number;
  status: string;
  rejection_reason: string | null;
  submitted_at: string;
  actioned_at: string | null;
  tx_hash: string | null;
}

export default function GiftCardPage() {
  const { user } = useAuth();
  const [state, setState] = useState<FlowState>("select");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [currency, setCurrency] = useState("USD");
  const [denomination, setDenomination] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [cardPin, setCardPin] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentRedemption, setCurrentRedemption] = useState<Redemption | null>(null);
  const [countdown, setCountdown] = useState(90);
  const [history, setHistory] = useState<Redemption[]>([]);
  const [historyFilter, setHistoryFilter] = useState("all");
  const [historyPage, setHistoryPage] = useState(0);
  const [activeTab, setActiveTab] = useState("redeem");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardAmount = denomination === "custom" ? Number(customAmount) || 0 : Number(denomination) || 0;
  const commission = cardAmount * COMMISSION_RATE;
  const payout = cardAmount - commission;

  // Fetch history
  useEffect(() => {
    if (!user) return;
    fetchHistory();
  }, [user]);

  async function fetchHistory() {
    const { data } = await supabase
      .from("gift_card_redemptions")
      .select("*")
      .eq("user_id", user!.id)
      .order("submitted_at", { ascending: false });
    if (data) setHistory(data as unknown as Redemption[]);
  }

  // Realtime subscription for pending redemption
  useEffect(() => {
    if (!currentRedemption || state !== "pending") return;

    const channel = supabase
      .channel(`redemption-${currentRedemption.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "gift_card_redemptions",
          filter: `id=eq.${currentRedemption.id}`,
        },
        (payload) => {
          const updated = payload.new as unknown as Redemption;
          setCurrentRedemption(updated);
          if (updated.status === "approved") {
            setState("success");
            if (countdownRef.current) clearInterval(countdownRef.current);
            toast.success(`✅ $${updated.usdt_payout.toFixed(2)} USDT credited to your wallet`);
          } else if (updated.status === "rejected") {
            setState("rejected");
            if (countdownRef.current) clearInterval(countdownRef.current);
            toast.error(`❌ Redemption failed — ${updated.rejection_reason || "Unknown reason"}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentRedemption, state]);

  // Countdown timer
  useEffect(() => {
    if (state !== "pending") return;
    setCountdown(90);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [state]);

  const handleSubmit = async () => {
    if (!user || !selectedBrand || cardAmount <= 0 || !cardCode.trim()) return;
    setSubmitting(true);
    setState("pending");

    const { data, error } = await supabase
      .from("gift_card_redemptions")
      .insert({
        user_id: user.id,
        user_email: user.email || "",
        reference_number: "", // trigger will generate
        brand: selectedBrand,
        card_currency: currency,
        card_value: cardAmount,
        card_code: cardCode.trim(),
        card_pin: cardPin.trim() || null,
        commission_rate: COMMISSION_RATE,
        commission_amount: commission,
        usdt_payout: payout,
        status: "pending",
      })
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit. Please try again.");
      setState("details");
      return;
    }

    setCurrentRedemption(data as unknown as Redemption);
    toast("Card submitted — validating...");
  };

  const reset = () => {
    setState("select");
    setSelectedBrand("");
    setCurrency("USD");
    setDenomination("");
    setCustomAmount("");
    setCardCode("");
    setCardPin("");
    setConfirmed(false);
    setCurrentRedemption(null);
    setCountdown(90);
    fetchHistory();
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const filteredHistory = history.filter((h) =>
    historyFilter === "all" ? true : h.status === historyFilter
  );
  const pagedHistory = filteredHistory.slice(historyPage * 10, (historyPage + 1) * 10);

  const brandObj = BRANDS.find((b) => b.id === selectedBrand);

  // Circular progress for countdown
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const progress = (countdown / 90) * circumference;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Gift className="text-primary" size={24} />
        <div>
          <h1 className="font-display font-bold text-xl text-foreground">Redeem Gift Card</h1>
          <p className="text-xs text-muted-foreground">Receive USDT in your wallet. Validated in ~90 seconds.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="redeem">Redeem</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="redeem">
          <AnimatePresence mode="wait">
            {/* STEP 1: Select Brand */}
            {state === "select" && (
              <motion.div key="select" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <p className="text-sm text-muted-foreground mb-4">Select a gift card brand</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand.id}
                      onClick={() => { setSelectedBrand(brand.id); setState("details"); }}
                      className={`border rounded-xl p-4 flex flex-col items-center gap-2 transition-all hover:border-primary/50 ${
                        selectedBrand === brand.id ? "border-primary bg-primary/5" : "border-border bg-card"
                      }`}
                    >
                      <brand.icon size={28} className={brand.color} />
                      <span className="text-xs font-medium text-foreground">{brand.name}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Enter Details */}
            {state === "details" && (
              <motion.div key="details" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <button onClick={() => setState("select")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft size={14} /> Back to brands
                </button>

                <div className="flex items-center gap-2 mb-6">
                  {brandObj && <brandObj.icon size={20} className={brandObj.color} />}
                  <span className="font-semibold text-foreground capitalize">{selectedBrand} Gift Card</span>
                </div>

                <div className="space-y-4">
                  {/* Currency */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Card Currency</label>
                    <div className="flex gap-2 flex-wrap">
                      {CURRENCIES.map((c) => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            currency === c ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Denomination */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Card Denomination</label>
                    <div className="flex gap-2 flex-wrap">
                      {DENOMINATIONS.map((d) => (
                        <button
                          key={d}
                          onClick={() => setDenomination(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            denomination === d ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                          }`}
                        >
                          {d === "custom" ? "Custom" : `$${d}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {denomination === "custom" && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Custom Amount</label>
                      <input
                        type="number"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                        placeholder="Enter amount"
                        min="1"
                        className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm outline-none focus:border-primary transition-all"
                      />
                    </div>
                  )}

                  {/* Card Code */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Gift Card Code</label>
                    <input
                      type="text"
                      value={cardCode}
                      onChange={(e) => setCardCode(e.target.value.toUpperCase())}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm font-mono outline-none focus:border-primary transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* PIN */}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      PIN <span className="text-muted-foreground/50">(if required)</span>
                    </label>
                    <input
                      type="password"
                      value={cardPin}
                      onChange={(e) => setCardPin(e.target.value)}
                      placeholder="Enter PIN"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground text-sm font-mono outline-none focus:border-primary transition-all placeholder:text-muted-foreground/40"
                    />
                  </div>

                  {/* Confirmation checkbox */}
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(e) => setConfirmed(e.target.checked)}
                      className="mt-0.5 rounded border-border"
                    />
                    <span className="text-xs text-muted-foreground">
                      I confirm this card has not been used or partially redeemed
                    </span>
                  </label>

                  {/* Fee Breakdown */}
                  {cardAmount > 0 && (
                    <Card className="border-border">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Card Value</span>
                          <span className="text-foreground">${cardAmount.toFixed(2)} {currency}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Commission (30%)</span>
                          <span className="text-destructive">-${commission.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                          <span className="text-muted-foreground">You Receive</span>
                          <span className="text-primary">${payout.toFixed(2)} USDT</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    onClick={() => setState("confirm")}
                    disabled={!confirmed || cardAmount <= 0 || !cardCode.trim()}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Continue to Review <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Confirm */}
            {state === "confirm" && (
              <motion.div key="confirm" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                <button onClick={() => setState("details")} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-4">
                  <ArrowLeft size={14} /> Back to details
                </button>

                <Card className="border-border mb-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Review & Confirm</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Brand</span>
                      <span className="text-foreground capitalize">{selectedBrand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Card Value</span>
                      <span className="text-foreground">${cardAmount.toFixed(2)} {currency}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Commission (30%)</span>
                      <span className="text-destructive">-${commission.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-border my-2" />
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-foreground">You Receive</span>
                      <span className="text-primary">${payout.toFixed(2)} USDT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated time</span>
                      <span className="text-foreground">~90 seconds</span>
                    </div>
                  </CardContent>
                </Card>

                <p className="text-xs text-muted-foreground mb-4 text-center">
                  ⚠️ Card codes are submitted securely. Do not share your code anywhere else.
                </p>

                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-base font-semibold"
                >
                  {submitting ? (
                    <Loader2 size={18} className="animate-spin mr-2" />
                  ) : (
                    <Gift size={18} className="mr-2" />
                  )}
                  Submit for Redemption →
                </Button>
              </motion.div>
            )}

            {/* STEP 4: Pending with Countdown */}
            {state === "pending" && (
              <motion.div key="pending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center py-8">
                {/* Circular countdown */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <svg width="140" height="140" className="-rotate-90">
                    <circle
                      cx="70" cy="70" r={radius}
                      fill="none"
                      stroke="hsl(var(--border))"
                      strokeWidth="6"
                    />
                    <circle
                      cx="70" cy="70" r={radius}
                      fill="none"
                      stroke={countdown > 0 ? "hsl(45, 100%, 50%)" : "hsl(var(--destructive))"}
                      strokeWidth="6"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono font-bold text-2xl text-foreground">
                      {countdown > 0 ? formatTime(countdown) : "—"}
                    </span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {countdown > 0
                    ? `Validating your ${selectedBrand} gift card...`
                    : "Extended — Please wait"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Our team is verifying your card balance offline. Do not close this window.
                </p>

                {currentRedemption && (
                  <Badge variant="outline" className="text-xs border-amber-500/30 text-amber-400">
                    <Clock size={12} className="mr-1" />
                    {currentRedemption.reference_number} — Pending
                  </Badge>
                )}
              </motion.div>
            )}

            {/* STEP 5: Success */}
            {state === "success" && currentRedemption && (
              <motion.div key="success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6"
                >
                  <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
                    <Check size={28} className="text-primary-foreground" strokeWidth={3} />
                  </div>
                </motion.div>

                <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">Redemption Complete!</h3>

                <Card className="border-border mt-6 text-left">
                  <CardContent className="p-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card</span>
                      <span className="text-foreground capitalize">{currentRedemption.brand} ${currentRedemption.card_value} {currentRedemption.card_currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Commission</span>
                      <span className="text-foreground">${currentRedemption.commission_amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold">
                      <span className="text-foreground">USDT Credited</span>
                      <span className="text-primary">${currentRedemption.usdt_payout.toFixed(2)}</span>
                    </div>
                    {currentRedemption.tx_hash && (
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Tx Hash</span>
                        <a
                          href={`https://basescan.org/tx/${currentRedemption.tx_hash}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary text-xs flex items-center gap-1 hover:underline"
                        >
                          {currentRedemption.tx_hash.slice(0, 10)}...
                          <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reference</span>
                      <span className="text-foreground font-mono text-xs">{currentRedemption.reference_number}</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={reset} className="flex-1">
                    Redeem Another Card
                  </Button>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Rejected */}
            {state === "rejected" && currentRedemption && (
              <motion.div key="rejected" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="text-center py-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  className="w-20 h-20 rounded-full bg-destructive/15 flex items-center justify-center mx-auto mb-6"
                >
                  <div className="w-14 h-14 rounded-full bg-destructive flex items-center justify-center">
                    <X size={28} className="text-destructive-foreground" strokeWidth={3} />
                  </div>
                </motion.div>

                <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">Redemption Failed</h3>

                <Card className="border-destructive/30 mt-4 mb-6">
                  <CardContent className="p-4">
                    <p className="text-sm text-destructive">
                      {currentRedemption.rejection_reason || "Your card could not be verified."}
                    </p>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={reset} className="flex-1">
                    Try Again
                  </Button>
                  <Button variant="outline" className="flex-1 text-muted-foreground">
                    Contact Support
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        {/* HISTORY TAB */}
        <TabsContent value="history">
          <div className="flex gap-2 mb-4 flex-wrap">
            {["all", "pending", "approved", "rejected"].map((f) => (
              <button
                key={f}
                onClick={() => { setHistoryFilter(f); setHistoryPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize ${
                  historyFilter === f ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Gift size={32} className="text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No redemptions found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pagedHistory.map((r) => (
                <Card key={r.id} className="border-border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground capitalize">{r.brand}</span>
                        <span className="text-xs text-muted-foreground">${r.card_value} {r.card_currency}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          r.status === "approved"
                            ? "border-primary/30 text-primary"
                            : r.status === "rejected"
                            ? "border-destructive/30 text-destructive"
                            : r.status === "pending"
                            ? "border-amber-500/30 text-amber-400"
                            : "border-blue-500/30 text-blue-400"
                        }`}
                      >
                        {r.status === "pending" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse mr-1.5" />}
                        {r.status === "approved" && <Check size={10} className="mr-1" />}
                        {r.status === "rejected" && <X size={10} className="mr-1" />}
                        {r.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{new Date(r.submitted_at).toLocaleDateString()}</span>
                      <span className="text-primary font-semibold">${r.usdt_payout.toFixed(2)} USDT</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">{r.reference_number}</div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {filteredHistory.length > 10 && (
                <div className="flex justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={historyPage === 0}
                    onClick={() => setHistoryPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-xs text-muted-foreground flex items-center">
                    Page {historyPage + 1} of {Math.ceil(filteredHistory.length / 10)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={(historyPage + 1) * 10 >= filteredHistory.length}
                    onClick={() => setHistoryPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
