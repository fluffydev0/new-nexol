import { motion } from "framer-motion";
import { Check } from "lucide-react";

const PricingSection = () => {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3 text-center">Pricing</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-16 text-center">
          Simple pricing. No surprises.
        </h2>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-card rounded-2xl p-8 glow-border relative"
          >
            <span className="absolute top-4 right-4 text-xs bg-primary text-primary-foreground px-3 py-1 rounded-full font-semibold">
              MOST POPULAR
            </span>
            <h3 className="font-display font-bold text-xl mb-1">Standard</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display font-extrabold text-4xl">20%</span>
              <span className="text-muted-foreground text-sm">per card</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">We only charge when you sell gift cards. Everything else is free.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Sell gift cards and get paid in 60 seconds",
                "Cash out crypto to your bank — free",
                "Auto-savings vault with weekly payouts — free",
                "Earn up to 6.1% interest on locked savings",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#waitlist" className="block text-center bg-primary text-primary-foreground font-semibold py-3 rounded-full hover:opacity-90 transition-opacity">
              Join Waitlist
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl p-8 glow-border"
          >
            <h3 className="font-display font-bold text-xl mb-1">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="font-display font-extrabold text-4xl">Custom</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">For businesses processing large volumes or building on our platform.</p>
            <ul className="space-y-3 mb-8">
              {[
                "Everything in Standard",
                "Connect via API to your own apps",
                "Lower fees based on volume",
                "A dedicated person to help you",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <a href="#" className="block text-center border border-border text-foreground font-semibold py-3 rounded-full hover:border-primary/50 transition-colors">
              Contact Sales
            </a>
          </motion.div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Bank transfers and savings vault are completely free. The 20% fee only applies when selling gift cards.
        </p>
      </div>
    </section>
  );
};

export default PricingSection;
