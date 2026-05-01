import { motion } from "framer-motion";

const stats = [
  {
    value: "$900M",
    description: "worth of gift cards are traded in Nigeria every year — most through informal WhatsApp dealers who take 35–50% of your value.",
    source: "Industry estimates, 2024",
  },
  {
    value: "57%",
    description: "of salary earners run out of money in the first week of the month — no buffer for bills, emergencies, or savings.",
    source: "EFInA Financial Report, 2023",
  },
  {
    value: "$400M",
    description: "in crypto changes hands monthly in Nigeria, but there's still no easy, reliable way to convert it to Naira.",
    source: "Chainalysis, 2024",
  },
];

const WhySection = () => {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm text-primary font-medium mb-3">Why This Matters</p>
        <h2 className="font-display font-extrabold text-3xl md:text-5xl mb-16 max-w-xl">
          Managing money in Nigeria shouldn't be this hard.
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-8 glow-border"
            >
              <span className="font-display font-extrabold text-5xl gradient-text">{s.value}</span>
              <p className="text-muted-foreground mt-4 leading-relaxed text-sm">{s.description}</p>
              <p className="text-xs text-muted-foreground/60 mt-4">{s.source}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhySection;
