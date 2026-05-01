import { useState } from "react";
import { motion } from "framer-motion";

const WaitlistCTA = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <section id="waitlist" className="py-24 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
          Be first to <span className="gradient-text">take control</span>
        </h2>
        <p className="text-muted-foreground mb-10">
          We're launching soon. Sign up now to get early access and exclusive perks — no spam, just real updates.
        </p>

        {submitted ? (
          <div className="bg-card rounded-2xl p-8 glow-border">
            <span className="text-4xl mb-4 block">🎉</span>
            <p className="font-display font-bold text-xl">You're on the list!</p>
            <p className="text-muted-foreground text-sm mt-2">We'll reach out when it's your turn.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-accent rounded-full px-5 py-3.5 text-foreground outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <button
              type="submit"
              className="bg-primary text-primary-foreground font-semibold px-8 py-3.5 rounded-full hover:opacity-90 transition-opacity text-sm whitespace-nowrap"
            >
              Join the Waitlist
            </button>
          </form>
        )}
        <a
          href="/admin/giftcards"
          className="inline-block mt-8 text-xs text-muted-foreground/40 hover:text-muted-foreground transition-colors"
        >
          Admin Panel →
        </a>
      </motion.div>
    </section>
  );
};

export default WaitlistCTA;
