import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, X, ArrowLeft, ExternalLink, CreditCard, Apple, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type FlowState = "entry" | "verifying" | "submitted" | "error";
type CardType = "amazon" | "apple";

const SERVICE_FEE_RATE = 0.20; // 20%

const GiftCardRedemption = ({ onBack }: { onBack?: () => void }) => {
  const { user } = useAuth();
  const [state, setState] = useState<FlowState>("entry");
  const [cardType, setCardType] = useState<CardType>("amazon");
  const [code, setCode] = useState("");
  const [pin, setPin] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(0);

  const isValid = code.trim().length > 0 && Number(amount) > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !user) return;
    setError("");
    setSubmitting(true);
    setState("verifying");

    const cardAmount = Number(amount);
    const fee = cardAmount * SERVICE_FEE_RATE;
    const payout = cardAmount - fee;
    setPayoutAmount(payout);

    const { error: insertError } = await supabase
      .from("gift_card_submissions")
      .insert({
        user_id: user.id,
        card_type: cardType,
        card_code: code.trim(),
        card_pin: pin.trim() || null,
        card_amount: cardAmount,
        service_fee: fee,
        usdc_payout: payout,
        status: "pending",
      });

    setSubmitting(false);

    if (insertError) {
      setError("Failed to submit. Please try again.");
      setState("error");
      return;
    }

    setState("submitted");
  };

  const reset = () => {
    setState("entry");
    setCode("");
    setPin("");
    setAmount("");
    setError("");
    setPayoutAmount(0);
  };

  const cardAmount = Number(amount) || 0;
  const fee = cardAmount * SERVICE_FEE_RATE;
  const payout = cardAmount - fee;

  return (
    <div className="w-full max-w-[420px] mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-8">
        {onBack && (
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
        )}
        <h2 className="font-display font-bold text-xl text-foreground">Redeem a Gift Card</h2>
      </div>

      <AnimatePresence mode="wait">
        {(state === "entry" || state === "error") && (
          <motion.div
            key="entry"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            {state === "error" && error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-destructive/10 border border-destructive/30 rounded-xl px-4 py-3 mb-6 flex items-start gap-3"
              >
                <X size={18} className="text-destructive mt-0.5 shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            {/* Card Type Selector */}
            <div className="relative bg-card rounded-xl p-1 flex mb-6">
              <motion.div
                className="absolute inset-y-1 rounded-lg bg-secondary/20 border border-secondary/40"
                layout
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                style={{
                  left: cardType === "amazon" ? "4px" : "50%",
                  width: "calc(50% - 4px)",
                }}
              />
              <button
                type="button"
                onClick={() => setCardType("amazon")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  cardType === "amazon" ? "text-secondary" : "text-muted-foreground"
                }`}
              >
                <CreditCard size={18} />
                Amazon
              </button>
              <button
                type="button"
                onClick={() => setCardType("apple")}
                className={`relative z-10 flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                  cardType === "apple" ? "text-secondary" : "text-muted-foreground"
                }`}
              >
                <Apple size={18} />
                Apple
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Gift Card Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full bg-card border border-border rounded-xl px-4 py-3.5 pr-12 text-foreground text-sm font-mono outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all placeholder:text-muted-foreground/40"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-secondary transition-colors"
                    title="Scan card"
                  >
                    <Camera size={18} />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {cardType === "amazon" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-xs text-muted-foreground mb-1.5 block font-medium">
                      Gift Card PIN <span className="text-muted-foreground/50">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="Enter PIN if available"
                      className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-sm font-mono outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all placeholder:text-muted-foreground/40"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card Amount */}
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block font-medium">Card Value (USD)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 50"
                  min="1"
                  className="w-full bg-card border border-border rounded-xl px-4 py-3.5 text-foreground text-sm outline-none focus:border-secondary focus:ring-1 focus:ring-secondary/30 transition-all placeholder:text-muted-foreground/40"
                />
              </div>

              {/* Fee Breakdown */}
              {cardAmount > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-card border border-border rounded-xl p-4 space-y-2"
                >
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Card Value</span>
                    <span className="text-foreground">${cardAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Service Fee (20%)</span>
                    <span className="text-destructive">-${fee.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between text-sm font-semibold">
                    <span className="text-muted-foreground">You'll receive</span>
                    <span className="text-primary">${payout.toFixed(2)} USDC</span>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!isValid || submitting}
                className="w-full bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-all disabled:opacity-30 disabled:cursor-not-allowed mt-2"
              >
                {state === "error" ? "Try Again" : "Submit for Verification"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-5">
              ⚡ Your card will be reviewed and USDC released to your wallet
            </p>
          </motion.div>
        )}

        {/* Verifying / Submitting */}
        {state === "verifying" && (
          <motion.div
            key="verifying"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center py-12"
          >
            <Loader2 size={40} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Submitting your gift card...</p>
          </motion.div>
        )}

        {/* Submitted */}
        {state === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
              className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.3 }}
                className="w-14 h-14 rounded-full bg-primary flex items-center justify-center"
              >
                <Check size={28} className="text-primary-foreground" strokeWidth={3} />
              </motion.div>
            </motion.div>

            <h3 className="font-display font-extrabold text-2xl text-foreground mb-2">
              Submitted for Review!
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Our team will verify your gift card and release <span className="text-primary font-semibold">${payoutAmount.toFixed(2)} USDC</span> to your wallet once approved.
            </p>

            <div className="bg-card rounded-2xl p-5 border border-border space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Status</span>
                <span className="text-sm font-semibold text-yellow-400">⏳ Pending Review</span>
              </div>
              <div className="border-t border-border" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Expected payout</span>
                <span className="text-sm font-display font-bold text-primary">${payoutAmount.toFixed(2)} USDC</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={reset}
                className="flex-1 border border-border text-foreground font-semibold py-3.5 rounded-xl text-sm hover:border-secondary/50 transition-colors"
              >
                Redeem Another
              </button>
              <button
                onClick={onBack}
                className="flex-1 bg-secondary text-secondary-foreground font-semibold py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Go to Wallet
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GiftCardRedemption;
