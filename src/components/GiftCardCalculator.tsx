import { useState } from "react";
import { motion } from "framer-motion";
import { Gift } from "lucide-react";

const cards = [
  { name: "Amazon", icon: "🛒", color: "hsl(var(--primary))" },
  { name: "Apple", icon: "🍎", color: "hsl(var(--secondary))" },
];

const GiftCardCalculator = () => {
  const [selected, setSelected] = useState(0);
  const [amount, setAmount] = useState(100);
  const fee = amount * 0.2;
  const payout = amount - fee;
  const nairaRate = 1598;
  const nairaValue = payout * nairaRate;

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Gift Card Calculator</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
          See what your gift card is worth.
        </h2>
        <p className="text-muted-foreground mb-12">
          Select your card type, enter the value, and instantly see your payout after our flat 20% service fee.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-8 glow-border"
        >
          {/* Card type selector */}
          <label className="text-sm text-muted-foreground mb-3 block">Card Type</label>
          <div className="flex gap-3 mb-8">
            {cards.map((c, i) => (
              <button
                key={c.name}
                onClick={() => setSelected(i)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all ${
                  selected === i
                    ? "bg-primary/10 border border-primary text-primary"
                    : "bg-accent border border-border text-muted-foreground hover:border-muted-foreground"
                }`}
              >
                <span className="text-lg">{c.icon}</span>
                {c.name}
              </button>
            ))}
          </div>

          {/* Amount input */}
          <label className="text-sm text-muted-foreground mb-2 block">Card Value (USD)</label>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="bg-accent rounded-xl px-4 py-3 text-foreground font-display font-bold text-2xl w-full outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Breakdown */}
          <div className="bg-accent/50 rounded-xl p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{cards[selected].icon} {cards[selected].name} Gift Card</span>
              <span className="text-foreground font-medium">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service Fee (20%)</span>
              <span className="text-destructive font-medium">− ${fee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span className="text-foreground">You Receive</span>
              <span className="text-primary">${payout.toFixed(2)} USDC</span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>NGN Equivalent</span>
              <span>≈ ₦{nairaValue.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-5 text-center">
            ⚡ Funds credited in <span className="text-primary font-medium">under 60 seconds</span> after verification
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default GiftCardCalculator;
