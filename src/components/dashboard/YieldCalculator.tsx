import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Duration = "7d" | "3m" | "6m" | "1y";

const durations: { key: Duration; label: string; days: number; apy: number }[] = [
  { key: "7d", label: "7 Days", days: 7, apy: 0 },
  { key: "3m", label: "3 Months", days: 90, apy: 6 },
  { key: "6m", label: "6 Months", days: 180, apy: 8 },
  { key: "1y", label: "12 Months", days: 365, apy: 10 },
];

export default function YieldCalculator() {
  const [amount, setAmount] = useState("1000");
  const [selected, setSelected] = useState<Duration>("6m");

  const dur = durations.find((d) => d.key === selected)!;
  const principal = parseFloat(amount) || 0;
  const interest = (principal * dur.apy / 100) * (dur.days / 365);
  const finalBalance = principal + interest;

  const chartData = useMemo(() => {
    const points = 12;
    return Array.from({ length: points + 1 }, (_, i) => {
      const fraction = i / points;
      const daysSoFar = Math.round(dur.days * fraction);
      const earned = (principal * dur.apy / 100) * (daysSoFar / 365);
      return {
        day: `Day ${daysSoFar}`,
        balance: parseFloat((principal + earned).toFixed(2)),
        principal: principal,
      };
    });
  }, [principal, dur]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-bold text-2xl text-foreground">Yield Calculator</h2>
        <p className="text-sm text-muted-foreground mt-1">Estimate your earnings across lock durations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-5">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Deposit Amount (USDC)</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-accent border-border text-2xl h-14 font-display font-bold"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Lock Duration</label>
            <div className="grid grid-cols-2 gap-2">
              {durations.map((d) => (
                <button
                  key={d.key}
                  onClick={() => setSelected(d.key)}
                  className={`rounded-xl p-3 border text-center transition-all ${
                    selected === d.key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-accent text-muted-foreground hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-semibold text-sm">{d.label}</p>
                  <p className={`text-xs mt-0.5 ${d.apy === 0 ? "text-muted-foreground" : "text-primary"}`}>
                    {d.apy === 0 ? "0% APY" : `${d.apy}% APY`}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="space-y-3 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Interest Earned</span>
              <motion.span
                key={interest}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-display font-bold text-primary"
              >
                +${interest.toFixed(2)}
              </motion.span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Final Balance</span>
              <motion.span
                key={finalBalance}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="font-display font-bold text-xl text-foreground"
              >
                ${finalBalance.toFixed(2)}
              </motion.span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">APY</span>
              <span className="font-semibold text-foreground">{dur.apy}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{dur.days} days</span>
            </div>
          </div>
        </div>

        {/* Chart Panel */}
        <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={18} className="text-primary" />
            <h3 className="font-display font-semibold text-foreground">Growth Projection</h3>
          </div>
          <div className="h-[300px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="yieldGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(156, 100%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(156, 100%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0, 0%, 15%)" />
                <XAxis
                  dataKey="day"
                  tick={{ fill: "hsl(240, 4%, 65%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(0, 0%, 15%)" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "hsl(240, 4%, 65%)", fontSize: 11 }}
                  axisLine={{ stroke: "hsl(0, 0%, 15%)" }}
                  tickLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 7%)",
                    border: "1px solid hsl(0, 0%, 15%)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  labelStyle={{ color: "hsl(240, 4%, 65%)" }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Balance"]}
                />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stroke="hsl(240, 4%, 35%)"
                  strokeDasharray="4 4"
                  fill="none"
                  strokeWidth={1}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(156, 100%, 50%)"
                  fill="url(#yieldGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {dur.apy === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-3">
              7-day deposits earn no interest. Choose a longer lock for yield.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
