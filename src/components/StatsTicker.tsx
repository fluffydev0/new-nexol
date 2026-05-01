const stats = [
  { value: "$900M", label: "Nigeria gift card market annually", icon: "⬆" },
  { value: "60s", label: "automated redemption pipeline", icon: "⚡" },
  { value: "$400M", label: "monthly P2P crypto volume NG", icon: "⬆" },
  { value: "57%", label: "salary spent in week 1", icon: "📊" },
  { value: "6.1%", label: "APY on 1-year vault lock", icon: "🔒" },
  { value: "$0.001", label: "avg transaction fee on Base", icon: "⬇" },
  { value: "2s", label: "Base L2 block finality", icon: "⚡" },
];

const StatsTicker = () => {
  const doubled = [...stats, ...stats];

  return (
    <section className="relative border-y border-border py-5 overflow-hidden">
      <div className="ticker-scroll flex gap-12 w-max">
        {doubled.map((s, i) => (
          <div key={i} className="flex items-center gap-3 whitespace-nowrap">
            <span className="font-display font-extrabold text-base sm:text-lg text-foreground">{s.value}</span>
            <span className="text-sm text-muted-foreground">{s.label}</span>
            <span className="text-xs">{s.icon}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsTicker;
