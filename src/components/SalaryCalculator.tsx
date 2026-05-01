import { useState } from "react";
import { motion } from "framer-motion";

const SalaryCalculator = () => {
  const [salary, setSalary] = useState(100);
  const weekly = salary / 4;

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Calculator</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-4">
          See how your salary splits up.
        </h2>
        <p className="text-muted-foreground mb-12">Enter what you earn monthly. See exactly how much you get each week — and how much stays locked and growing.</p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl p-8 glow-border"
        >
          <label className="text-sm text-muted-foreground mb-2 block">Monthly Salary (USDC)</label>
          <div className="flex items-center gap-3 mb-8">
            <span className="text-muted-foreground">$</span>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(Math.max(0, Number(e.target.value)))}
              className="bg-accent rounded-xl px-4 py-3 text-foreground font-display font-bold text-2xl w-full outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-3">
            {[1, 2, 3, 4].map((w) => (
              <div key={w} className="flex justify-between items-center bg-accent/50 rounded-xl px-3 sm:px-5 py-3 sm:py-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className={`text-lg ${w === 1 ? "text-primary" : "text-muted-foreground"}`}>
                    {w === 1 ? "✅" : "🔒"}
                  </span>
                  <div>
                    <p className="text-sm font-medium">Week {w} {w === 1 ? "— Available now" : "— Locked"}</p>
                    <p className="text-xs text-muted-foreground">
                      {w === 1 ? "Instant access" : `Unlocks in ${(w - 1) * 7} days`}
                    </p>
                  </div>
                </div>
                <span className={`font-display font-bold ${w === 1 ? "text-primary" : "text-foreground"}`}>
                  ${weekly.toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground mt-6 text-center">
            Lock for 6 months and earn <span className="text-primary font-medium">4.2% interest</span> · Lock for a year and earn <span className="text-primary font-medium">6.1% interest</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default SalaryCalculator;
