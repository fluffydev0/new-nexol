import { motion } from "framer-motion";
import { Gift, Banknote, Vault } from "lucide-react";

const features = [
  {
    icon: <Gift className="w-8 h-8" />,
    tag: "01 · Sell Gift Cards",
    title: "Got a gift card? Get paid in 60 seconds.",
    description:
      "No more hunting for buyers on WhatsApp or getting ripped off by middlemen. Upload your gift card, we verify it instantly, and you get USDC (digital dollars) in your wallet in under a minute. One flat 20% fee — transparent and fair.",
    cards: ["AMAZON", "APPLE", "GOOGLE PLAY", "NETFLIX", "STEAM"],
    detail: (
      <div className="mt-6 bg-accent/50 rounded-xl p-5 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Amazon Card</span><span className="text-foreground">$100.00</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (20%)</span><span className="text-destructive">− $20.00</span></div>
        <div className="border-t border-border my-2" />
        <div className="flex justify-between font-semibold"><span>You Receive</span><span className="text-primary">$80.00 USDC</span></div>
        <div className="flex justify-between text-xs text-muted-foreground"><span>NGN Equivalent</span><span>≈ ₦127,840</span></div>
        <p className="text-xs text-primary mt-2">⚡ Credited in 47 seconds</p>
      </div>
    ),
    large: true,
  },
  {
    icon: <Banknote className="w-8 h-8" />,
    tag: "02 · Cash Out Crypto",
    title: "Send crypto to your bank account.",
    description:
      "Have USDC or other crypto? Convert it to Naira and receive it in any Nigerian bank account in minutes — GTBank, Access, Zenith, you name it. Live exchange rates, full receipt, no shady P2P deals.",
    cards: ["USDC → NGN", "ANY BANK", "LIVE RATES", "BASE L2"],
    detail: (
      <div className="mt-6 bg-accent/50 rounded-xl p-5 text-sm space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">💎</span>
          <div>
            <p className="text-muted-foreground text-xs">You Send · NexolPay wallet</p>
            <p className="text-foreground font-semibold">100 USDC</p>
          </div>
        </div>
        <div className="text-center text-muted-foreground">↓</div>
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">🏦</span>
          <div>
            <p className="text-muted-foreground text-xs">GTBank · ****4421 · ETA ~2 min</p>
            <p className="text-foreground font-semibold">₦159,800</p>
          </div>
        </div>
      </div>
    ),
    large: false,
  },
  {
    icon: <Vault className="w-8 h-8" />,
    tag: "03 · Smart Savings Vault",
    title: "Stop spending your salary in one week.",
    description:
      "Deposit your pay and choose how it gets released — weekly portions, monthly, or lock it for 6–12 months. Once locked, you can't touch it early — that's the point. Long-term locks also earn you interest (up to 6.1% APY).",
    cards: ["WEEKLY", "MONTHLY", "6M · 4.2% APY", "1YR · 6.1% APY"],
    detail: (
      <div className="mt-6 bg-accent/50 rounded-xl p-5 text-sm space-y-2">
        {["WEEK 1 · Available now", "WEEK 2 · Unlocks Monday", "WEEK 3 · Unlocks in 2 weeks", "WEEK 4 · Unlocks in 3 weeks"].map((w, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-muted-foreground">{w}</span>
            <span className={i === 0 ? "text-primary font-semibold" : "text-muted-foreground"}>
              {i === 0 ? "$250 LIVE" : "🔒 $250"}
            </span>
          </div>
        ))}
        <p className="text-xs text-primary mt-3">📈 6-month: 4.2% APY · 1-year: 6.1% APY on Base</p>
      </div>
    ),
    large: false,
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">What NexolPay Does</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4 max-w-2xl">
          Three tools to take control of your money.
        </h2>
        <p className="text-muted-foreground mb-16 max-w-xl">
          Sell gift cards instantly. Send crypto to your bank. Save smarter with auto-locked vaults.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card rounded-2xl p-8 glow-border ${i === 0 ? "md:col-span-2" : ""}`}
            >
              <div className="text-primary mb-4">{f.icon}</div>
              <p className="text-xs text-muted-foreground font-medium mb-2">{f.tag}</p>
              <h3 className="font-display font-bold text-xl md:text-2xl mb-3">{f.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-lg">{f.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {f.cards.map((c) => (
                  <span key={c} className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground">{c}</span>
                ))}
              </div>
              {f.detail}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
