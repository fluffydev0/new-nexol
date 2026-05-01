import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Handshake,
  CalendarClock,
  Landmark,
  ShieldCheck,
  ClipboardCheck,
  Globe2,
  History,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
  Wallet,
  Edit3,
  Users,
  Clock,
  Check,
} from "lucide-react";
import nexolLogo from "@/assets/nexolpay-logo.png";

const navLinks = [
  { label: "Escrow", href: "#solutions" },
  { label: "Solutions", href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
];

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-mesh font-body text-ink">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-cream/70 border-b border-ink/5">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={nexolLogo} alt="NexolPay" className="w-9 h-9 rounded-lg" />
            <span className="font-display text-2xl font-semibold text-ink tracking-tight">NexolPay</span>
          </Link>

          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-sm text-ink/70 hover:text-ink transition-colors">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="hidden sm:inline-block text-sm text-ink/80 hover:text-ink transition-colors">
              Login
            </Link>
            <Link
              to="/dashboard"
              className="bg-ink text-cream text-sm font-semibold px-5 py-2.5 rounded-full hover:bg-ink/90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 lg:pt-24 pb-24 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-gold/20 text-ink/80 text-xs font-bold tracking-wider uppercase px-3 py-1.5 rounded-full mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-gold-deep" />
              Securing the African Frontier
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-ink">
              The Crypto Wallet
              <br />
              <span className="relative inline-block">
                <span className="relative z-10">For African</span>
                <span className="absolute inset-x-0 bottom-1 h-3 bg-gold/60 -z-0" />
              </span>
              <br />
              Creators.
            </h1>

            <p className="mt-8 text-lg text-ink/70 max-w-xl leading-relaxed">
              NexolPay is the crypto wallet for African creators — with income scheduling, freelance escrow, and yield
              savings built in. <span className="text-ink font-medium">Manage your money. Protect your work. Grow your earnings.</span> All in one place.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 bg-ink text-cream font-semibold px-7 py-4 rounded-full hover:bg-ink/90 transition-all shadow-lg shadow-ink/10"
              >
                Start Escrow Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 bg-white/60 backdrop-blur border border-ink/10 text-ink font-semibold px-7 py-4 rounded-full hover:bg-white transition-all"
              >
                Explore Features
              </Link>
            </div>
          </motion.div>

          {/* Hero card mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div className="relative max-w-md mx-auto perspective-lg">
              <div className="relative bg-gradient-to-br from-navy to-navy-deep rounded-3xl p-8 premium-shadow">
                <div className="flex items-center gap-2 mb-8">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-gold" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>

                <div className="flex items-start justify-between gap-6">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-gold-deep via-gold to-amber-700 flex items-center justify-center shadow-xl">
                    <div className="w-20 h-20 rounded-xl bg-navy-deep/40 flex items-center justify-center">
                      <Lock className="w-10 h-10 text-gold" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-wider text-cream/50 font-bold">Escrow Status</p>
                    <p className="font-display text-3xl font-semibold text-cream mt-2">$4,500 USDC</p>
                    <div className="mt-6 h-1 w-full bg-cream/10 rounded-full overflow-hidden">
                      <div className="h-full w-2/3 bg-gold rounded-full" />
                    </div>
                    <p className="text-[10px] text-cream/50 mt-3 uppercase tracking-wider">
                      Milestone 2 of 3 secured
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -right-6 w-20 h-20 bg-gold rounded-2xl flex items-center justify-center shadow-xl floating">
                <Lock className="w-8 h-8 text-navy-deep" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* THE REALITY */}
      <section className="bg-navy-deep text-cream py-24 px-6 lg:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block bg-gold/20 text-gold text-xs font-bold tracking-widest uppercase px-3 py-1.5 rounded-full mb-8">
            The Reality
          </span>
          <h2 className="font-display text-3xl md:text-5xl font-medium leading-tight">
            "You designed the logo. You built the app. You shipped the code. And then…{" "}
            <span className="text-gold italic">silence.</span>"
          </h2>
          <p className="mt-8 text-cream/60 text-lg leading-relaxed">
            NexolPay was built specifically to ensure that never happens again. We bridge the gap between completed
            work and guaranteed payment using immutable smart contracts.
          </p>
        </div>
      </section>

      {/* THREE TOOLS */}
      <section id="solutions" className="py-24 px-6 lg:px-12 bg-cream">
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-tight">
                Three tools. One platform.
              </h2>
              <p className="mt-4 text-ink/60 max-w-xl">
                Architected for professionals who demand certainty in an uncertain digital economy.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-ink/10 hover:bg-ink hover:text-cream transition-all"
            >
              <ArrowUpRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Freelancer Escrow */}
            <ToolCard
              icon={<Handshake className="w-5 h-5" />}
              title="Freelancer Escrow"
              description="Funds are locked in a smart contract before work begins. When milestones are met, payment is released automatically. No disputes, no delays."
              className="lg:col-span-1 bg-white"
            >
              <div className="bg-cream rounded-2xl p-5 mt-6 border border-ink/5">
                <p className="text-[10px] uppercase tracking-wider text-ink/50 font-bold">Active Contract</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-ink font-semibold text-sm">Milestone 1: Wireframes</p>
                  <p className="font-display text-xl font-semibold text-ink">$1,200</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Funded On-Chain
                  </span>
                  <button className="bg-ink text-cream text-xs font-semibold px-3 py-1.5 rounded-full">
                    Release Payment
                  </button>
                </div>
              </div>
            </ToolCard>

            {/* Income Scheduler */}
            <ToolCard
              icon={<CalendarClock className="w-5 h-5" />}
              iconBg="bg-gold/30 text-gold-deep"
              title="Income Scheduler"
              description="Smooth out variable income. Deposit lump sums and set up automated, steady payouts to yourself over time."
              className="bg-white"
            >
              <div className="bg-navy-deep rounded-2xl p-5 mt-6 text-cream">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-cream/50 font-bold">Monthly Budget</p>
                    <p className="font-display text-2xl font-semibold mt-1">$850.00</p>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-4 h-1 w-full bg-cream/10 rounded-full overflow-hidden">
                  <div className="h-full w-[64%] bg-gold rounded-full" />
                </div>
                <div className="flex items-center justify-between mt-3 text-[11px] text-cream/60">
                  <span>Next: Oct 15</span>
                  <span>64% Automated</span>
                </div>
              </div>
            </ToolCard>

            {/* Income Vault */}
            <ToolCard
              icon={<Landmark className="w-5 h-5" />}
              iconBg="bg-gold/20 text-gold-deep"
              title="Income Vault"
              description="Secure your long-term wealth. Multi-signature protection and time-locked vaults ensure your hard-earned capital remains untouched until you truly need it."
              className="lg:col-span-2 bg-navy-deep text-cream"
              dark
            >
              <div className="mt-6 grid sm:grid-cols-2 gap-4">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs bg-cream/10 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> 48h Time-lock
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs bg-cream/10 px-3 py-1.5 rounded-full">
                    <Users className="w-3.5 h-3.5" /> Multi-Sig
                  </span>
                </div>
                <div className="flex items-center justify-end">
                  <div className="w-24 h-24 rounded-2xl border border-cream/15 flex items-center justify-center bg-cream/5">
                    <Lock className="w-8 h-8 text-gold" />
                  </div>
                </div>
              </div>
            </ToolCard>
          </div>
        </div>
      </section>

      {/* DASHBOARD MOCKUP */}
      <section className="py-24 px-6 lg:px-12 bg-cream">
        <div className="max-w-[1280px] mx-auto">
          <h2 className="font-display text-4xl md:text-5xl font-semibold text-center text-ink tracking-tight">
            The Nexol Dashboard.
          </h2>

          <div className="mt-16 relative">
            <div className="bg-navy-deep rounded-3xl p-6 lg:p-10 premium-shadow text-cream">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-gold" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-cream/40 font-mono">nexolpay.io/dashboard</span>
                <Link to="/dashboard" className="text-xs text-gold hover:underline">
                  Open →
                </Link>
              </div>

              <div className="grid lg:grid-cols-3 gap-5">
                {/* Liquidity */}
                <div className="lg:col-span-2 bg-cream/5 rounded-2xl p-6 border border-cream/10">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-cream/50 font-bold">
                        Available Liquidity
                      </p>
                      <p className="font-display text-4xl font-semibold mt-2">
                        $42,850.00 <span className="text-sm text-emerald-400 font-sans">+12.4%</span>
                      </p>
                    </div>
                    <Wallet className="w-5 h-5 text-cream/40" />
                  </div>
                  <div className="mt-6 grid grid-cols-7 gap-2 h-32 items-end">
                    {[40, 55, 30, 70, 45, 95, 60].map((h, i) => (
                      <div
                        key={i}
                        className={`rounded-md ${i === 5 ? "bg-gold" : "bg-cream/15"}`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>

                {/* Income Schedule */}
                <div className="bg-cream/5 rounded-2xl p-6 border border-cream/10">
                  <p className="text-[10px] uppercase tracking-wider text-cream/50 font-bold mb-4">
                    Income Schedule
                  </p>
                  <div className="space-y-4">
                    {["OCT 15, 2024", "OCT 30, 2024", "NOV 15, 2024"].map((d) => (
                      <div key={d} className="flex items-center justify-between text-sm">
                        <span className="text-cream/60 text-xs font-mono">{d}</span>
                        <span className="font-semibold">$1,200.00</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-cream/10">
                    <p className="text-[10px] uppercase tracking-wider text-cream/50 font-bold">Vault Growth</p>
                    <p className="font-display text-2xl font-semibold text-emerald-400 mt-1">+8.2% APY</p>
                  </div>
                </div>

                {/* Bottom strip */}
                <div className="lg:col-span-2 bg-cream/5 rounded-2xl p-5 border border-cream/10 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-gold" />
                  <div>
                    <p className="text-sm font-semibold">Vault Protection</p>
                    <p className="text-xs text-cream/50">48h Time-lock Active</p>
                  </div>
                </div>
                <div className="bg-cream/5 rounded-2xl p-5 border border-cream/10">
                  <p className="text-xs text-cream/50">Active Escrows</p>
                  <p className="font-semibold mt-1 text-sm">Mobile App v2 · Brand Strategy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="py-24 px-6 lg:px-12 bg-cream">
        <div className="max-w-[1280px] mx-auto grid lg:grid-cols-2 gap-16 items-start">
          <div className="grid sm:grid-cols-2 gap-5">
            {[
              { icon: <ShieldCheck className="w-5 h-5" />, title: "Non-Custodial", desc: "We never hold your keys. You maintain absolute control over your funds at all times." },
              { icon: <ClipboardCheck className="w-5 h-5" />, title: "Fully Audited", desc: "Smart contracts rigorously tested and audited by top-tier security firms." },
              { icon: <Globe2 className="w-5 h-5" />, title: "Protocol Level", desc: "Built directly on robust L2 infrastructure for minimal fees and maximum security." },
              { icon: <History className="w-5 h-5" />, title: "Immutable Record", desc: "Every transaction and escrow agreement is permanently recorded on-chain." },
            ].map((f) => (
              <div key={f.title} className="bg-white border border-ink/5 rounded-2xl p-6 architect-grid-item">
                <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-ink mb-4 border border-ink/5">
                  {f.icon}
                </div>
                <h4 className="font-display text-lg font-semibold text-ink">{f.title}</h4>
                <p className="text-sm text-ink/60 mt-2 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="lg:pl-8 lg:pt-12">
            <span className="inline-block text-xs font-bold tracking-widest uppercase text-ink/50 mb-4">
              The Foundation of Trust
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-tight">
              Your money is protected at the protocol level.
            </h2>
            <p className="mt-6 text-ink/60 text-lg leading-relaxed">
              Trust shouldn't rely on promises. It should be written in code. NexolPay leverages open-source, audited
              smart contracts to guarantee execution without human intervention.
            </p>
            <Link
              to="/dashboard"
              className="mt-8 inline-flex items-center gap-2 text-ink font-semibold border-b-2 border-ink pb-1 hover:gap-3 transition-all"
            >
              View Audit Reports <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-6 lg:px-12 bg-cream">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold tracking-widest uppercase text-ink/50 mb-4">
            Pricing
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-tight">
            Simple, transparent pricing.
          </h2>
          <p className="mt-4 text-ink/60 text-lg">
            We only charge when you use Scheduler or Freelance Escrow. Everything else is free.
          </p>
        </div>

        <div className="mt-14 max-w-md mx-auto">
          <div className="bg-white rounded-3xl p-10 border border-ink/5 premium-shadow relative">
            <span className="absolute top-5 right-5 text-[10px] uppercase tracking-widest font-bold bg-gold text-navy-deep px-3 py-1 rounded-full">
              Flat Rate
            </span>
            <p className="text-xs uppercase tracking-widest text-ink/50 font-bold">Standard</p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="font-display text-6xl font-semibold text-ink">2%</span>
              <span className="text-ink/60 text-sm">per transaction</span>
            </div>
            <p className="mt-4 text-ink/60 text-sm leading-relaxed">
              We charge a flat 2% fee only on Income Scheduler payouts and Freelance Escrow releases.
            </p>
            <ul className="mt-8 space-y-3 text-left">
              {[
                "2% on Income Scheduler payouts",
                "2% on Freelance Escrow releases",
                "Free wallet, vault, and yield savings",
                "No hidden fees, ever",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-ink/75">
                  <Check className="w-4 h-4 text-gold-deep mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/dashboard"
              className="mt-10 block text-center bg-ink text-cream font-semibold py-3.5 rounded-full hover:bg-ink/90 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="px-6 lg:px-12 py-16 bg-cream">
        <div className="max-w-[1280px] mx-auto bg-navy-deep rounded-3xl px-8 lg:px-16 py-16 text-center text-cream relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{
            background: "radial-gradient(circle at 30% 20%, rgba(254,209,117,0.4), transparent 50%)"
          }} />
          <h3 className="relative font-display text-3xl md:text-5xl font-semibold tracking-tight">
            Ready to secure your work?
          </h3>
          <p className="relative mt-4 text-cream/60 max-w-xl mx-auto">
            Open your NexolPay dashboard and start protecting every payment, every milestone.
          </p>
          <Link
            to="/dashboard"
            className="relative mt-8 inline-flex items-center gap-2 bg-gold text-navy-deep font-semibold px-8 py-4 rounded-full hover:bg-gold/90 transition-all"
          >
            Launch Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-navy-deep text-cream pt-20 pb-10 px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-[1280px] mx-auto relative">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <img src={nexolLogo} alt="NexolPay" className="w-9 h-9 rounded-lg" />
                <span className="font-display text-2xl font-semibold">NexolPay</span>
              </div>
              <p className="text-sm text-cream/60 leading-relaxed max-w-xs">
                Providing high-fidelity crypto escrow and advanced income management tools for the builders of the
                African frontier.
              </p>
            </div>

            <FooterCol title="Platform" links={["Security Infrastructure", "Freelance Hub", "Milestones"]} />
            <FooterCol title="Resources" links={["API Documentation", "Contact Support", "Whitepaper"]} />
            <FooterCol title="Legal" links={["Privacy Policy", "Terms of Service", "Cookie Policy"]} />
          </div>

          <div className="border-t border-cream/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
            <p className="text-xs text-cream/50">© {new Date().getFullYear()} NexolPay. All Rights Reserved.</p>
            <p className="text-xs text-cream/50">Built for the African Frontier</p>
          </div>

          <div className="absolute -bottom-10 left-0 right-0 text-center pointer-events-none select-none">
            <span className="font-display font-semibold text-cream/[0.04] text-[180px] leading-none tracking-tight">
              NEXOL
            </span>
          </div>

          <div className="text-center mt-6 relative z-10">
            <Link to="/admin/giftcards" className="text-[10px] text-cream/20 hover:text-cream/40 transition-colors">
              Admin Panel →
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

const ToolCard = ({
  icon,
  iconBg = "bg-ink/5 text-ink",
  title,
  description,
  children,
  className = "",
  dark = false,
}: {
  icon: React.ReactNode;
  iconBg?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) => (
  <div className={`rounded-3xl p-8 border architect-grid-item ${dark ? "border-cream/10" : "border-ink/5"} ${className}`}>
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-6 ${iconBg}`}>{icon}</div>
    <h3 className={`font-display text-2xl font-semibold mb-3 ${dark ? "text-cream" : "text-ink"}`}>{title}</h3>
    <p className={`text-sm leading-relaxed max-w-md ${dark ? "text-cream/60" : "text-ink/60"}`}>{description}</p>
    {children}
  </div>
);

const FooterCol = ({ title, links }: { title: string; links: string[] }) => (
  <div>
    <p className="text-xs uppercase tracking-widest text-cream/40 font-bold mb-4">{title}</p>
    <ul className="space-y-3">
      {links.map((l) => (
        <li key={l}>
          <a href="/dashboard" className="text-sm text-cream/80 hover:text-gold transition-colors">
            {l}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

export default LandingPage;
