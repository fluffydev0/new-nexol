import { motion } from "framer-motion";

const BaseSection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-sm text-primary font-medium mb-3">Built on Base L2</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4 max-w-2xl mx-auto">
          Bank-grade security. Fraction-of-a-penny fees.
        </h2>
        <p className="text-muted-foreground mb-16 max-w-2xl mx-auto">
          Your money moves on Base — a secure blockchain network backed by Coinbase. Transactions cost less than ₦1, settle in seconds, and are protected by Ethereum's security.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-lg mx-auto">
          {[
            { value: "$0.001", label: "Avg tx fee" },
            { value: "2s", label: "Block finality" },
            { value: "∞", label: "EVM compatible" },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-2xl p-6 glow-border"
            >
              <span className="font-display font-extrabold text-3xl gradient-text">{s.value}</span>
              <p className="text-muted-foreground text-sm mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BaseSection;
