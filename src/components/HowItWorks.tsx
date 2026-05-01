import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Sign up in seconds",
    desc: "Use your phone number to create an account. Verify your identity with BVN or NIN. We set up a secure wallet for you automatically — no complicated setup.",
  },
  {
    num: "02",
    title: "Add money or sell a gift card",
    desc: "Deposit USDC directly, or upload a gift card (Amazon, Apple, etc.). We verify it and credit your wallet in under 60 seconds.",
  },
  {
    num: "03",
    title: "Cash out to your bank",
    desc: "Convert your balance to Naira and send it to any Nigerian bank account. You'll see the exact exchange rate upfront — no surprises.",
  },
  {
    num: "04",
    title: "Set up auto-savings",
    desc: "Choose how your money gets released — weekly, monthly, or lock it away for 6–12 months to earn interest.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Getting Started</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
          Up and running in 5 minutes.
        </h2>
        <p className="text-muted-foreground mb-16">No crypto knowledge needed. No seed phrases. Just sign up and go.</p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 glow-border"
            >
              <span className="font-display font-extrabold text-3xl gradient-text">{s.num}</span>
              <h3 className="font-display font-bold text-lg mt-4 mb-2">{s.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
