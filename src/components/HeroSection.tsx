import { motion } from "framer-motion";
import { Zap, Lock, Globe } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 overflow-hidden">
      {/* Radial glow */}
      <div className="absolute inset-0 radial-glow pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 text-xs text-muted-foreground mb-8">
          <span className="text-primary">★</span> YOUR MONEY, YOUR RULES · BUILT FOR AFRICA
        </div>

        <h1 className="font-display font-extrabold text-4xl sm:text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6">
          Turn gift cards{" "}
          <br className="hidden md:block" />
          into real{" "}
          <span className="gradient-text">money.</span>
        </h1>

        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Sell gift cards for <span className="text-foreground font-medium">fair rates in 60 seconds</span>. Cash out crypto straight to your bank account. Set up a savings plan that actually stops you from overspending.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href="/dashboard"
            className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-base"
          >
            Get Early Access →
          </a>
          <a
            href="#features"
            className="border border-border text-foreground font-medium px-8 py-3.5 rounded-full hover:border-primary/50 transition-colors text-base"
          >
            How It Works
          </a>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Instant gift card payouts
          </span>
          <span className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" /> Auto-save your salary
          </span>
          <span className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" /> Made for Nigerians
          </span>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
